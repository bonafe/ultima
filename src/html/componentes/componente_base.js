export class ComponenteBase extends HTMLElement{


    constructor(propriedades){
        super();
        
        this.carregado = false;        

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


    //TODO: MELHORAR A RESOLUÇÃO DE ENDEREÇOS
    static resolverEndereco(endereco){

        let url = undefined;

        try{

            //Apenas conseguirá carregar o endereço se for uma URL absoluta
            url = new URL (endereco);

        }catch(e){

            //No caso de URLs relativas, são todas consideradas a partir da localização do ComponenteBase (este arquivo)
            //Meta informação deste arquivo (pois está usando classes/módulos)
            let url_deste_arquivo = new URL(import.meta.url);
            //Este arquivo fica por padrão, relativo a raiz, na pasta /componentes
            
            let partes_url_deste_arquivo = url_deste_arquivo.pathname.split("/");
                        
            let indice_encontrado = partes_url_deste_arquivo.lastIndexOf("componentes");                

            let inicio_url = partes_url_deste_arquivo.slice(0,indice_encontrado).join("/")
            
            endereco = inicio_url + endereco;            

            return new URL(endereco, url_deste_arquivo.origin); 
        }
    }

    async carregarTemplate(templateURL){       
              
        let resposta = await fetch(ComponenteBase.resolverEndereco(templateURL));
        let textoPagina = await resposta.text();
        let template = document.createElement("template");
        template.innerHTML = textoPagina;
        let elemento = template.content.cloneNode(true);

        elemento.querySelectorAll("link").forEach(elemento => {
            //Os endereços dos CSS dos templates são carregados em relação ao window.location
            let indice_location_origin = elemento.href.indexOf(window.location.origin);
            //Tiramos o window.location do endereço para ter o endereço relativo
            let novoEnderecoCSS = elemento.href.slice(indice_location_origin + window.location.origin.length);
            //Usamos a função de resolução de endereço para corrigir o endereço do CSS
            elemento.href = ComponenteBase.resolverEndereco(novoEnderecoCSS)
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

    static carregarCSS (no, endereco_css){        
        return new Promise ((resolve, reject) => {

            let link  = document.createElement('link');            
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = ComponenteBase.resolverEndereco(endereco_css);            

            link.media = 'all';
            link.onload = () => {
                resolve(true);
            };
            no.appendChild(link);        
        });
    }
}