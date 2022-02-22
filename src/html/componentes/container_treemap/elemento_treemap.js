import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';



export class ElementoTreeMap extends ComponenteBase {



    static EVENTO_AUMENTAR = 'EVENTO_AUMENTAR';
    static EVENTO_DIMINUIR = 'EVENTO_DIMINUIR';
    static EVENTO_IR_PARA_TRAS = 'EVENTO_IR_PARA_TRAS';
    static EVENTO_IR_PARA_FRENTE = 'EVENTO_IR_PARA_FRENTE';    
    static EVENTO_IR_PARA_INICIO = 'EVENTO_IR_PARA_INICIO';
    static EVENTO_IR_PARA_FIM = 'EVENTO_IR_PARA_FIM'; 
    static EVENTO_MAXIMIZAR = 'EVENTO_MAXIMIZAR'; 
    static EVENTO_MINIMIZAR = 'EVENTO_MINIMIZAR';
    static EVENTO_RESTAURAR = 'EVENTO_RESTAURAR';
    static EVENTO_MUDAR_VISUALIZACAO = 'EVENTO_MUDAR_VISUALIZACAO';
    static EVENTO_FECHAR = 'EVENTO_FECHAR';
    



    constructor(){
        super({templateURL:"/componentes/container_treemap/elemento_treemap.html", shadowDOM:true});

        this.dados = null;

        this.addEventListener("carregou", () => {  

            //Se o atributo dados foi preenchido
            if (this.componente){                             
                this.carregarComponente();
            }

            this.noRaiz.querySelector("#aumentar").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_AUMENTAR, {detail:{id:this._id}}));
            });
            this.noRaiz.querySelector("#diminuir").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_DIMINUIR, {detail:this._id}));
            });
            this.noRaiz.querySelector("#irParaTras").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_IR_PARA_TRAS, {detail:this._id}));
            });
            this.noRaiz.querySelector("#irParaFrente").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_IR_PARA_FRENTE, {detail:this._id}));
            });
            this.noRaiz.querySelector("#irParaInicio").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_IR_PARA_INICIO, {detail:this._id}));
            });
            this.noRaiz.querySelector("#irParaFim").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_IR_PARA_FIM, {detail:this._id}));
            });
            this.noRaiz.querySelector("#maximizar").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_MAXIMIZAR, {detail:this._id}));
            });
            this.noRaiz.querySelector("#restaurar").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_RESTAURAR, {detail:this._id}));
            });
            this.noRaiz.querySelector("#minimizar").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_MINIMIZAR, {detail:this._id}));
            });
            this.noRaiz.querySelector("#fechar").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_FECHAR, {detail:this._id}));
            });            
            /*this.noRaiz.querySelector("#mudarVisualizacao").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_MUDAR_VISUALIZACAO, {detail:this._id}));
            });*/
        });
    }



    static get observedAttributes() {
        return ['dados','componente','id'];
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
            this.dados  = JSON.parse(novoValor);
            if (this.instanciaComponente){
                this.instanciaComponente.setAttribute("dados", JSON.stringify(this.dados));
            }

        } else if (nomeAtributo.localeCompare("id") == 0){
            this._id = Number(novoValor);
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
                this.instanciaComponente.setAttribute("dados", JSON.stringify(this.dados));
            }

            this.instanciaComponente.classList.add('componente');

            this.noRaiz.querySelector("#containerComponente").appendChild(this.instanciaComponente);

            this.instanciaComponente.addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_DADOS, evento => {

                //Para a propagaçaõ do evento do componente
                evento.stopPropagation();
               
                //Cria um novo evento indicando dados do componente
                let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_DADOS, {                                              
                        dados:evento.detail.novoValor,
                        id: this._id,                    
                });
                
                this.dispatchEvent(eventoCompleto);                
            });

            this.instanciaComponente.addEventListener(UltimaEvento.EVENTO_SELECAO_OBJETO, evento => {

                //Para a propagaçaõ do evento do componente
                evento.stopPropagation();
               
                //Cria um novo evento indicando dados do componente
                let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_SELECAO_OBJETO, {                                                                      
                        id_origem: this._id,                    
                        dados:evento.detail,
                });
                
                this.dispatchEvent(eventoCompleto);                
            });

            this.componenteCarregado = true;
        });
    }
}
customElements.define('elemento-treemap', ElementoTreeMap);