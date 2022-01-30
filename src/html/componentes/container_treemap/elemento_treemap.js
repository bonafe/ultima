import { ComponenteBase } from '../componente_base.js';



export class ElementoTreeMap extends ComponenteBase {

    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO';

    constructor(){
        super({templateURL:"/componentes/container_treemap/elemento_treemap.html", shadowDOM:true});

        this.dados = null;

        this.addEventListener("carregou", () => {  

            //Se o atributo dados foi preenchido
            if (this.componente){                             
                this.carregarComponente();
            }
        });
    }



    static get observedAttributes() {
        return ['dados','componente'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

        //Atributo componente é usado pelo ElementoTreeMap para definir qual componente renderizar
        if (nomeAtributo.localeCompare("componente") == 0){

            this.componente = JSON.parse(novoValor);

            //Se o componente base já foi carregado
            if (this.carregado){
                this.carregarComponente();
            }
        } else if (nomeAtributo.localeCompare("dados") == 0){
            this.dados  = novoValor;
            if (this.instanciaComponente){
                this.instanciaComponente.setAttribute("dados", this.dados);
            }
        }
    }



    carregarComponente(){

        //Se é uma URL relativa, usa o prefixo de endereço preenchido pelo ComponenteBase
        //Caso contrário usa a própria url
        let url = (this.componente.url.startsWith('/') ? (super.prefixoEndereco + this.componente.url) : this.componente.url);
        
        //Carrega dinamicamente o componente
        import(url).then(modulo => {

            this.instanciaComponente = document.createElement(this.componente.nome);

            if (this.dados){
                this.instanciaComponente.setAttribute("dados", this.dados);
            }

            //O componente deve retornar esse mesmo tipo de evento
            this.instanciaComponente.addEventListener(ElementoTreeMap.EVENTO_SELECAO_OBJETO, evento => {
                this.selecionouObjeto(evento.detail);
            });

            this.noRaiz.querySelector("#containerComponente").appendChild(this.instanciaComponente);

            this.componenteCarregado = true;
        });
    }

    selecionouObjeto(objeto){        
        this.dispatchEvent(new CustomEvent(ElementoTreeMap.EVENTO_SELECAO_OBJETO, {detail:objeto}));        
    }
}
customElements.define('elemento-treemap', ElementoTreeMap);