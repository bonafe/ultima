import { ComponenteBase } from "../componente_base.js";
import { ContainerTreeMap } from "../container_treemap/container_treemap.js";
import { BaseTestesTreeMap } from "./base_teste.js";

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
                let novoId = e["proximoId"];
                e["proximoId"] = novoId + 1;

                e["telas"][0]["elementos"].push(
                    {
                        "id":novoId, 
                        "descricao": "Componente X",
                        "importancia": 10,
                        "componente":{                        
                            "url": "/componentes/equipe/grafo_equipe.js",
                            "nome": "grafo-equipe"
                        },                    
                        "dados":{...evento.detail.objeto}                        
                    }
                );
                this.controleNavegador.elementos = e;
            });
        });
    }
}
customElements.define('ultima-view', UltimaView);