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

    carregarCSS (endereco, url_filho){        
        return new Promise ((resolve, reject) => {

            let link  = document.createElement('link');            
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = (url_filho? ComponenteBase.resolverEndereco(endereco, url_filho) : this.resolverEndereco(endereco));            

            link.media = 'all';
            link.addEventListener("load", () => {
                resolve(true);
            });

            link.addEventListener("error", (e) => {
                console.log (`Erro ao carregar estilo: ${link.href}`);
                console.dir(e);
                reject();
            });
            this.noRaiz.appendChild(link);        
        });
    }

    carregarScript (endereco, url_filho, hash_integridade){         
        return new Promise ((resolve, reject) => {

            let script  = document.createElement('script');            
            script.setAttribute("async", "");
            script.src = (url_filho? ComponenteBase.resolverEndereco(endereco, url_filho) : this.resolverEndereco(endereco));

            //TODO: VERIFICAR não está funcionando eu acho, não está sendo usado ainda
            if (hash_integridade){
                script.integrity = hash_integridade;
                //TODO: verificar se precisa mesmo desse anonymous, copiado do bootstrap
                script.crossorigin="anonymous";
            }
            
            script.addEventListener("load", () => {
                resolve(true);
            });

            script.addEventListener("error", (e) => {
                console.log (`Erro ao carregar script: ${script.src}`);
                console.dir(e);
                reject();
            });

            this.noRaiz.appendChild(script);        
        });
    }
}