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



    async carregarTemplate(url_template, tentativas){       
        
        console.log (`Carregando template: ${url_template} (TENTAVIAS: ${tentativas})`);

        if (tentativas == undefined){
            tentativas = 0;
        }
        tentativas++;
        if (tentativas > 3){
            console.log (`Erro ao carregar template: ${url_template} NÚMERO DE TENTATIVAS EXCEDIDO (${tentativas})`);
            return false;
        }

        let resposta = await fetch(this.resolverEndereco(url_template));
        let textoPagina = await resposta.text();
        let template = document.createElement("template");
        template.innerHTML = textoPagina;
        let elemento = template.content.cloneNode(true);

        let hrefLinks = this.removerTagsLinkETrazerHRef(elemento);

        //Carrega todos os CSS do template
        Promise.all(hrefLinks.map( url_css => this.carregarCSS (url_css)))
            .then(resultados => {

                //Depois de carregar todos os CSS;
                this.noRaiz.appendChild(elemento);
                this.observar();
                this.carregado = true;
                this.dispatchEvent(new Event("carregou"));
            });
    }



    removerTagsLinkETrazerHRef(elemento){

        //Para todos os links do elemento
        return Array.from(elemento.querySelectorAll("link")).map(elementoLink => {
            
            //Extrai a URL (href) do link
            let url_css = elementoLink.getAttribute("href");

            //Remove o elemento link
            elementoLink.remove();
            
            return url_css;
        });       
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

    carregarCSS (endereco, url_filho, tentativas){     
        
        let url_css = (url_filho? ComponenteBase.resolverEndereco(endereco, url_filho) : this.resolverEndereco(endereco)); 

        console.log (`Carregando CSS: ${url_css} (TENTAVIAS: ${tentativas})`);
        
        if (tentativas == undefined){
            tentativas = 0;
        }
        tentativas++;        

        return new Promise ((resolve, reject) => {

            //TODO: AVANÇAR NO TRATAMENTO DE ERRO. O que acontece quando o recurso está indisponível?
            //1. Guardar em cache, se não conseguiu pegar o externo, pega o do cache
            //2. Pode pegar o do cache antes e nem ir atrás do externo, economiza recursos de rede
            //3. Como saber quando procurar por atualizações? Poderia receber mensagens falando que deve atualizar o recurso.
            //4. Quando o usuário edita a estrutura, componentes, recursos da aplicação do lado do cliente, como as atualizações ficam compatíveis com isso? Podem existir diferentes versões do mesmo componente? Se estiver dentro do ShadowDOM funciona?            
            if (tentativas > 3){
                console.log (`Erro ao carregar CSS: ${url_css} NÚMERO DE TENTATIVAS EXCEDIDO (${tentativas})`);
                return reject();
            }

            fetch(url_css)
                .then(response => response.text())
                .then(texto => {

                    let style  = document.createElement('style');            
                    style.innerHTML = texto;
                    
                    style.addEventListener("load", () => {
                        resolve(true);
                    });

                    style.addEventListener("error", (e) => {
                        reject();
                    });
                    this.noRaiz.appendChild(style);
                })
                .catch(function(error) {
                    console.log(`Não foi possível fazer download do CSS ${url_css}`);
                    reject();
                });      
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