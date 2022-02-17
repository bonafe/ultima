import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima.js';



export class ElementoTreeMap extends ComponenteBase {



    static EVENTO_AUMENTAR = 'EVENTO_AUMENTAR';
    static EVENTO_DIMINUIR = 'EVENTO_DIMINUIR';
    static EVENTO_IR_PARA_TRAS = 'EVENTO_IR_PARA_TRAS';
    static EVENTO_IR_PARA_FRENTE = 'EVENTO_IR_PARA_FRENTE';    
    static EVENTO_IR_PARA_INICIO = 'EVENTO_IR_PARA_INICIO';
    static EVENTO_IR_PARA_FIM = 'EVENTO_IR_PARA_FIM'; 
    static EVENTO_MUDAR_VISUALIZACAO = 'EVENTO_MUDAR_VISUALIZACAO';



    constructor(){
        super({templateURL:"/componentes/container_treemap/elemento_treemap.html", shadowDOM:true});

        this.dados = null;

        this.addEventListener("carregou", () => {  

            //Se o atributo dados foi preenchido
            if (this.componente){                             
                this.carregarComponente();
            }

            this.noRaiz.querySelector("#aumentar").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_AUMENTAR, {detail:this._id}));
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
            this.noRaiz.querySelector("#mudarVisualizacao").addEventListener("click", ()=>{
                this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_MUDAR_VISUALIZACAO, {detail:this._id}));
            });
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

            this.noRaiz.querySelector("#containerComponente").appendChild(this.instanciaComponente);

            this.instanciaComponente.addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_DADOS, evento => {

                //Para a propagaçaõ do evento do componente
                evento.stopPropagation();
               
                //Cria um novo evento indicando dados do componente
                let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_DADOS, {                    
                        componente: this.componente,                        
                        dados:evento.detail.novoValor,
                        id: this._id,                    
                });
                
                this.dispatchEvent(eventoCompleto);                
            });

            this.componenteCarregado = true;
        });
    }
}
customElements.define('elemento-treemap', ElementoTreeMap);