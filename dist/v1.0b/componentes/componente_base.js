export class ComponenteBase extends HTMLElement{


    constructor(propriedades, url_herdeiro){
        super();
                
        this.url_herdeiro = url_herdeiro;
        this.url_base = ComponenteBase.extrairCaminhoURL(this.url_herdeiro);


        this.carregado = false;        

        if (propriedades.shadowDOM){
            this.noRaiz = this.attachShadow({mode: 'open'});        
        }else{
            this.noRaiz = this;
        }        

        this.carregarTemplate(propriedades.templateURL);
    }

    //TODO: usar tag A com href para fazer parse no endereço e extrair o caminho
    static extrairCaminhoURL(url){
        return url.split(0, url.lastIndexOf("/")+1);
    }



    //TODO: MELHORAR A RESOLUÇÃO DE ENDEREÇOS    
    static resolverEndereco(endereco, url_base){

        let url = undefined;

        try{

            //Apenas conseguirá carregar o endereço se for uma URL absoluta
           return new URL (endereco);

        }catch(e){       

            //Trata URLs relativas a url do herdeiro de ComponenteBase
            return new URL(endereco, url_base); 
        }
    }



    resolverEndereco(endereco){
        return ComponenteBase.resolverEndereco(endereco, this.url_base);
    }



    async carregarTemplate(templateURL){       
              
        let resposta = await fetch(this.resolverEndereco(templateURL));
        let textoPagina = await resposta.text();
        let template = document.createElement("template");
        template.innerHTML = textoPagina;
        let elemento = template.content.cloneNode(true);

        elemento.querySelectorAll("link").forEach(elemento => {
            
            elemento.href = this.resolverEndereco(elemento.getAttribute("href"));
        });

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

    static carregarCSS (no, endereco_css, url_componente){        
        return new Promise ((resolve, reject) => {

            let link  = document.createElement('link');            
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = ComponenteBase.resolverEndereco(endereco_css, ComponenteBase.extrairCaminhoURL(url_componente));            

            link.media = 'all';
            link.onload = () => {
                resolve(true);
            };
            no.appendChild(link);        
        });
    }
}