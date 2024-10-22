class Test extends React.Component{
    constructor(){
        super();
    }

    
    connectedCallback(){
        this.render();
        this.attachShadow({mode : 'open'});
    }

    render(){
        return (
            <div>
                <p>test</p>
            </div>
        );
    }

}

//customElements.define('test-p', Test);