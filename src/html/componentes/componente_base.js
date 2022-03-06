export class ComponenteBase extends HTMLElement{


    constructor(propriedades){
        super();
        
        this.carregado = false;

        //TODO: como fazer se o componente está hospedado em outro domínio?
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

        this.carregado = true;
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
        let elemento_observado = this.noRaiz.querySelector(".observado");
        if (elemento_observado){        
            this.resizeObserver.observe(elemento_observado);      
        }
    }    


    
    connectedCallback() {
    }



    disconnectedCallback() {
    }



    adoptedCallback() {
    }

    static carregarCSS (no, endereco_css){        
        return new Promise ((resolve, reject) => {
            let link  = document.createElement('link');            
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = endereco_css;
            link.media = 'all';
            link.onload = () => {
                resolve(true);
            };
            no.appendChild(link);        
        });
    }
}