/**
GreenBUMS Backend -- Catalog API
@description LAMBDA Handler for Catalog API
@author Jeff Freeman <freeman8@arizone.edu>
@version 1.0.0
 */
import { 
  DynamoDBClient, 
  QueryCommand,
  PutItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";

const dynamo_config = { region: "us-east-2" };
const dynamo_client = new DynamoDBClient(dynamo_config);

const post_handler = async (body) => {
  var response = {
    statusCode: 200,
    body: JSON.stringify({}),
  };

  var request_raw = body;
  var request_body;
  var request_obj;

  // base64 conversion (if applicable)
  const base64_regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  if (base64_regex.test(request_raw)) {
    request_body = Buffer.from(request_raw, 'base64').toString('binary');
  }
  else {
    request_body = request_raw;
  }

  // event body preprocessor
  var request_obj;
  try {
    request_obj = JSON.parse(request_body);
    
    // invalid json string detected
    if (!(request_obj) || (typeof request_obj !== "object")) {
      throw new Error();
    }

    var request_fields = Object.getOwnPropertyNames(request_obj);
    var require_fields = ["email", "name", "photos", "notes"];
    var missing_fields = [];

    require_fields.forEach(field => {
      if (!request_fields.includes(field)) {
        missing_fields.push(field);
      }
    });

    if (missing_fields.length) {
      response.statusCode = 400;
      response.body = JSON.stringify({
        "error": "required fields missing", 
        "fields": missing_fields}
      );
      return response;
    }

  }
  catch (err) {
    // update the journal with encountered error
    response.statusCode = 400;
    response.body = JSON.stringify({"error": "invalid json body"});
    return response;
  }

  // verification -- email address valid

  const email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (email_regex.test(request_obj.email) == false) {
    response.statusCode = 400;
    response.body = JSON.stringify({"error": "invalid email address provided"});
    return response;
  }

  var command;
  var results;

  // verification -- email address exists
  command = new QueryCommand({
    "ExpressionAttributeNames": {
      "#kn0": "email"
    },
    "ExpressionAttributeValues": {
      ":kv0": { "S": `${request_obj.email}` }
    },
    "KeyConditionExpression": "#kn0 = :kv0",
    "Limit": 1,
    "ReturnConsumedCapacity": "TOTAL",
    "TableName":"Plant-Auth"
  });
  results = await dynamo_client.send(command);
  if (results.Items.length == 0) {
    response.statusCode = 404;
    response.body = JSON.stringify({"error": "not found", "email": request_obj.email});
    return response;
  }
  
  var photos = [];
  request_obj.photos.forEach(photo => {
    photos.push({"S": `${photo}`});
  });

  // database -- create entry
  let timestamp = Math.floor(Date.now() / 1000);
  command = new PutItemCommand({
    "ConditionExpression": "#pk <> :pkValue AND #sk <> :skValue",
    "ExpressionAttributeNames":{"#pk":"email","#sk":"timestamp"},
    "ExpressionAttributeValues":{
      ":pkValue":{"S":`${request_obj.email}`},
      ":skValue":{"N":`${timestamp}`}
    },
    "Item":{
      "email":{"S":`${request_obj.email}`},
      "timestamp":{"N":`${timestamp}`},
      "photos":{"L":photos},
      "name":{"S":`${request_obj.name}`},
      "notes":{"S":`${request_obj.notes}`}
    },
    "TableName":"Plant-Catalog"
  });
  await dynamo_client.send(command);

  response.statusCode = 201;
  response.body = JSON.stringify({})
  return response;
};

// const save_handler = async (body) => {
// TODO - Implement a save handler that creates a new object with the specified info after deletin the previous one
// }

const get_handler = async (queryStringParameters) => {
  var response = {
    statusCode: 200,
    body: JSON.stringify({}),
  };

  // verification -- queryStringParameters

  if ((queryStringParameters == null) || (queryStringParameters.email == undefined)) {
    response.statusCode = 400;  // bad request
    response.body = JSON.stringify({"error": "missing query string parameters", "fields": ["email"]});
    return response;
  }

  var email = queryStringParameters.email;

  var start = 0;
  if (queryStringParameters.start) {
    start = queryStringParameters.start;
  }
  var end = Math.floor(Date.now() / 1000);
  if (queryStringParameters.end) {
    end = queryStringParameters.end;
  }
  if (start > end) {
    end = [start, start = end][0];
  }

  var command;
  var results;

  command = new QueryCommand({
    "ExpressionAttributeNames":{
      "#kn0":"email",
      "#kn1":"timestamp"
    },"ExpressionAttributeValues":{
      ":kv0":{"S":`${email}`},
      ":kv1":{"N":`${start}`},
      ":kv1p2":{"N":`${end}`}
    },
    "KeyConditionExpression":"#kn0 = :kv0 AND #kn1 BETWEEN :kv1 AND :kv1p2",
    "Limit":300,
    "ReturnConsumedCapacity":"TOTAL",
    "Select":"ALL_ATTRIBUTES",
    "TableName":"Plant-Catalog"
  });

  results = await dynamo_client.send(command);
  
  if (results.Items.length == 0) {
    response.statusCode = 404;
    response.body = JSON.stringify({});
    return response;
  }
  
  var catalog = new Object();
  results.Items.forEach(result => {
    let key = result.timestamp.N;
    let photos = [];
    result.photos.L.forEach(photo => {
      photos.push(photo.S);
    });
    let val = {
      "name": result.name.S,
      "notes": result.notes.S,
      photos
    }
    catalog[`${key}`] = val;
  });
  response.statusCode = 200;
  response.body = JSON.stringify(catalog);
  return response;
};

const delete_handler = async (queryStringParameters) => {

  var response = {
    statusCode: 200,
    body: JSON.stringify({}),
  };

  // verification -- queryStringParameters

  if (queryStringParameters == null) {
    response.statusCode = 400;  // bad request
    response.body = JSON.stringify({"error": "missing query string parameters", "fields": ["email", "timestamp"]});
    return response;
  }
  if (queryStringParameters.email == undefined) {
    response.statusCode = 400;  // bad request
    response.body = JSON.stringify({"error": "missing query string parameters", "fields": ["email"]});
    return response;
  }
  if (queryStringParameters.timestamp == undefined) {
    response.statusCode = 400;  // bad request
    response.body = JSON.stringify({"error": "missing query string parameters", "fields": ["timestamp"]});
    return response;
  }

  var email = String(queryStringParameters.email);
  var timestamp = Number(queryStringParameters.timestamp);

  var command;
  var results;

  command = new DeleteItemCommand({
    "Key":{
      "email":{"S":`${email}`},
      "timestamp":{"N":`${timestamp}`}
    },
    "TableName":"Plant-Catalog",
    "ReturnValues": "ALL_OLD"
  });
  results = await dynamo_client.send(command);
  if (results.Attributes) {
    
    results.Attributes.photos.L.forEach(photo => {
      // TODO: delete images from S3

    });

    response.statusCode = 200;
    response.body = JSON.stringify({});
    return response;
  }
  else {
    response.statusCode = 404;
    response.body = JSON.stringify({});
    return response;  
  }
}


export const handler = async (event) => {
  // TODO implement
  let response = {
    statusCode: 200,
    body: JSON.stringify({"test":'Hello from Lambda!', "event": event}),
  };

  if (event.httpMethod == 'POST') {
    response = await post_handler(event.body);
  }
  // TODO implement the below once save_handler function is working
  // else if (event.httpMethod == 'SAVE') { 
  //   response = await save_handler(event.body);
  // }
  else if (event.httpMethod == 'GET') {
    response = await get_handler(event.queryStringParameters);
  }
  else if (event.httpMethod == 'DELETE') {
    response = await delete_handler(event.queryStringParameters);
  }
  else {
    response.statusCode = 405;
    response.body = JSON.stringify({"error": "unsupported method", event});
  }
  return response;
};
