export class ComponenteBase extends HTMLElement{


    constructor(propriedades){
        super();
        
        this.carregou = false;

        this._prefixoEndereco = window.location.href.substring(0, window.location.href.lastIndexOf("/"));

        if (propriedades.shadowDOM){
            this.noRaiz = this.attachShadow({mode: 'open'});        
        }else{
            this.noRaiz = this;
        }
        this.carregarTemplate(propriedades.templateURL);
    }


    
    get prefixoEndereco(){
        return this._prefixoEndereco;
    }



    async carregarTemplate(templateURL){        
        let resposta = await fetch(this.prefixoEndereco + templateURL);
        let textoPagina = await resposta.text();
        let template = document.createElement("template");
        template.innerHTML = textoPagina;
        let elemento = template.content.cloneNode(true);
        this.noRaiz.appendChild(elemento);
        
        //Observa no próximo laço de eventos
        setTimeout(()=>this.observar());

        this.carregou = true;
        this.dispatchEvent(new Event("carregou"));
    }



    observar(){
        this.resizeObserver = new ResizeObserver(elementos =>{
            elementos.forEach(elemento => {      
                if (this.processarNovasDimensoes){
                    this.processarNovasDimensoes (elemento.target.clientWidth, elemento.target.clientHeight);
                }
            });
        });
            
        //Irá observar o primeiro elemento div
        this.resizeObserver.observe(this.noRaiz.querySelector("div"));      
    }    


    
    connectedCallback() {
    }



    disconnectedCallback() {
    }



    adoptedCallback() {
    }
}