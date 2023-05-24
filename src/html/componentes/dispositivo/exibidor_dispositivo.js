import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';



export class ExibidorDispositivo extends ComponenteBase {



    constructor(){
        super({templateURL:"./exibidor_dispositivo.html", shadowDOM:true}, import.meta.url);

        this.video = undefined;        

        this.addEventListener("carregou", () => {            
        
            this.descricao = this.noRaiz.querySelector("#descricao");

            this.descricao.addEventListener("change", ()=>{
                this.mudouEstado();                
            });


            this.noRaiz.querySelector("#exibir").addEventListener("click", ()=>{
                this.dispatchEvent(new UltimaEvento(UltimaEvento.EVENTO_SELECAO_OBJETO, 
                    {
                        deviceId:this.dados.dadosMediaAPI.deviceId, 
                        kind:this.dados.dadosMediaAPI.kind
                    })
                );
            });

            this.renderizar();
        });
    }


    get dados(){
        return this._dados;
    }

    set dados (novoValor){
        this._dados = novoValor;
        this.renderizar();
    }

    mudouEstado(){
        this._dados.descricao = this.descricao.value;             
        this.dispatchEvent(new CustomEvent("change", {detail:this._dados, 'bubbles': true, 'composed':true}));
    }


    static get observedAttributes() {
        return ['dados'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

    
        if (nomeAtributo.localeCompare("dados") == 0){

            this._dados = JSON.parse(novoValor);         
            this.renderizar();
        }
    }



    renderizar(){
        
        if (super.carregado){
            this.atualizarCampos();
        }        
    }

    atualizarCampos(){

        this.noRaiz.querySelector("#descricao").value = this._dados.descricao;
        this.noRaiz.querySelector("#kind").textContent = this._dados.dadosMediaAPI.kind;
        this.noRaiz.querySelector("#deviceId").textContent = this._dados.dadosMediaAPI.deviceId;
        this.noRaiz.querySelector("#groupId").textContent =  this._dados.dadosMediaAPI.groupId;
        this.noRaiz.querySelector("#label").textContent =  this._dados.dadosMediaAPI.label;

    }
}
customElements.define('exibidor-dispositivo', ExibidorDispositivo);