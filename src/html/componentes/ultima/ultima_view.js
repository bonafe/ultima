import { ComponenteBase } from "../componente_base.js";
import { ContainerTreeMap } from "../container_treemap/container_treemap.js";
import { BaseTestesTreeMap } from "../container_treemap/base_teste.js";

export class UltimaView extends ComponenteBase{

    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO';

    constructor(){        
        super({templateURL:"/componentes/ultima/ultima_view.html", shadowDOM:false});
        
        this.addEventListener('carregou', () => {
            
            this.controleNavegador = this.noRaiz.querySelector("container-treemap");
            this.controleNavegador.elementos = BaseTestesTreeMap.base;

            this.noRaiz.querySelector("container-treemap").addEventListener(UltimaView.EVENTO_SELECAO_OBJETO, (evento) => {
                console.log ("Recebeu evento treemap");
                console.dir(evento.detail);
                let e = this.controleNavegador.elementos;
                e["telas"][0]["componentes"].push(
                    { 
                        "descricao": "Componente X",
                        "importancia": 10,
                        "componente":{                        
                            "url": "/componentes/editor_json/editor_json.js",
                            "nome": "editor-json"
                        },                    
                        "dados":{...evento.detail}                        
                    }
                );
                this.controleNavegador.elementos = e;
            });
        });
    }
}
customElements.define('ultima-view', UltimaView);