import { ComponenteBase } from '../../componente_base.js';
import { UltimaEvento } from '../../ultima/ultima_evento.js';


export class GeradorUUID extends ComponenteBase {

    constructor(){
        super({templateURL:"./gerador_uuid.html", shadowDOM:true}, import.meta.url);

        this._dados = undefined;

        this.addEventListener("carregou", () => {          
            this.renderizar();
        });
    }


    renderizar(){
        if (!this.renderizado && this.carregado){     
                        
            this.noRaiz.querySelector("#btnGerar").addEventListener("click", ()=> {
                this.gerarUUID();
            });

            this.renderizado = true;
        }
    }



    gerarUUID(){
        
        let uuid_gerado = window.crypto.randomUUID();
        let uuids = this.noRaiz.querySelector("#uuids");
        uuids.textContent = `${uuids.textContent}\n${uuid_gerado}`;                
    }
}
customElements.define('gerador-uuid', GeradorUUID);