import { EditorJSON } from "../dados/json/editor/editor_json.js";
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

        let estilos = document.createElement("link");
        this.noRaiz.appendChild(estilos);
        estilos.setAttribute("rel", "stylesheet");
        estilos.setAttribute("href","componentes/ultima/ultima_view.css")


        let div = document.createElement("div");
        this.noRaiz.insertBefore(div, this.noRaiz.querySelector("#editorJSON"));
        div.classList.add("navegacao_ultima");
        div.classList.add("cabecalho_principal_ultima");
        

        let a = document.createElement("a");  
        div.appendChild (a);        

        a.href = "#";
        a.textContent = "Download Configuração";
        a.onclick = () => {
            this.downloadObjectAsJson(this.dados, "configuracao_ultima");
        };        
    }

    downloadObjectAsJson(exportObj, exportName){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
}
customElements.define('configuracao-ultima', ConfiguracaoUltima);