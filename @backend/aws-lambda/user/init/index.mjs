/**
GreenBUMS Backend -- User Creation API
@description LAMBDA Handler for Creating User Accounts
@author Jeff Freeman <freeman8@arizone.edu>
@version 1.0.0
 */

import { 
  DynamoDBClient, 
  QueryCommand,
  PutItemCommand
} from "@aws-sdk/client-dynamodb";

const dynamo_config = { region: "us-east-2" };
const dynamo_client = new DynamoDBClient(dynamo_config);

const create_user = async (email, secret) => {

  var response = {
    statusCode: 200,
    body: JSON.stringify({}),
  };

  let input = {
    "ExpressionAttributeNames": {
      "#kn0": "email"
    },
    "ExpressionAttributeValues": {
      ":kv0": { "S": `${email}` }
    },
    "KeyConditionExpression": "#kn0 = :kv0",
    "Limit": 1,
    "ReturnConsumedCapacity": "TOTAL",
    "TableName":"Plant-Auth"
  };
  var results = await dynamo_client.send(new QueryCommand(input));

  if (results.Items.length) {
    response.statusCode = 409;
    response.body = JSON.stringify({
      "error": "email already exists!", 
      "email": email
    });
    return response;
  }

  // build Item to put in database
  let Item = {};
  Item.email = { "S": `${email}` };
  Item.secret = { "S": `${secret}` };
  
  await dynamo_client.send(new PutItemCommand({
    "TableName": "Plant-Auth",
    Item
  }));

  response.statusCode = 201;
  response.body = JSON.stringify({})
  return response;
};

export const handler = async (event) => {
  
  var response = {
    statusCode: 200,
    body: JSON.stringify(event.body),
  };

  var request_raw = event.body;
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
    request_obj = JSON.parse(event.body);
    
    // invalid json string detected
    if (!(request_obj) || (typeof request_obj !== "object")) {
      throw new Error();
    }

    var request_fields = Object.getOwnPropertyNames(request_obj);
    var require_fields = ["email", "secret"];
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
    return undefined;
  }

  const secret_regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!secret_regex.test(request_obj.secret)) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      "error": "weak secret",
      "rules": "Minimum eight characters, at least one letter, one number and one special character!"
    });
    return response;
  }

  const email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (email_regex.test(request_obj.email)) {
    // authentication
    response = await create_user(request_obj.email, request_obj.secret);
  }
  else {
    response.statusCode = 400;
    response.body = JSON.stringify({"error": "invalid email address provided"});
  }
  
  return response;
};
