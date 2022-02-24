import { EditorJSON } from "../editor_json/editor_json.js";
import { UltimaEvento } from "./ultima_evento.js";

export class ConfiguracaoUltima extends EditorJSON{

    constructor(){
        super();      
        
        this.addEventListener("carregou", () => {

            this.tratarDownloadConfiguracao();
            this.tratarEventoMudancaDados();            
        });        
    }



    tratarEventoMudancaDados(){
        window.addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_DADOS, evento => {
            console.dir (evento.detail);
        });
    }
    
    tratarDownloadConfiguracao(){
        let a = document.createElement("a");
        a.href = "#";
        a.textContent = "Download Configuração";
        a.onclick = () => {
            console.dir (this.dados);
        };
        this.noRaiz.appendChild(a);
    }
}
customElements.define('configuracao-ultima', ConfiguracaoUltima);