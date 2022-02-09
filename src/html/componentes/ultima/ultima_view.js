import { ComponenteBase } from "../componente_base.js";
import { UltimaEvento } from "./ultima.js";
import { ContainerTreeMap } from "../container_treemap/container_treemap.js";
import { BaseTestesTreeMap } from "./base_teste.js";

export class UltimaView extends ComponenteBase{

    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO';

    constructor(){        
        super({templateURL:"/componentes/ultima/ultima_view.html", shadowDOM:false});
        
        this.addEventListener('carregou', () => {
            
            this.controleNavegador = this.noRaiz.querySelector("container-treemap");
            this.controleNavegador.elementos = BaseTestesTreeMap.base;      

            this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_SELECAO_OBJETO, evento => {

                console.info ("ULTIMA: Recebeu evento seleção objeto");
                console.dir(evento.detail);               

                this.controleNavegador.adicionarElementos(
                    {                         
                        "descricao": "Componente X",
                        "importancia": 10,
                        "componente":{                        
                            "url": "/componentes/editor_json/editor_json.js",
                            "nome": "editor-json"
                        },                    
                        "dados":{...evento.detail.objeto}                        
                    }
                )
            });
        });
    }
}
customElements.define('ultima-view', UltimaView);