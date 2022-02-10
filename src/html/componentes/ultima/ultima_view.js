import { ComponenteBase } from "../componente_base.js";
import { UltimaEvento, UltimaDAO } from "./ultima.js";
import { ContainerTreeMap } from "../container_treemap/container_treemap.js";

export class UltimaView extends ComponenteBase{

    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO';

    constructor(){        
        super({templateURL:"/componentes/ultima/ultima_view.html", shadowDOM:false});
        
        this.addEventListener('carregou', () => {
            
            this.controleNavegador = this.noRaiz.querySelector("container-treemap");
            
            UltimaDAO.getInstance().telas().then (telas => {
                //TODO: só está pegando a primeira tela
                this.tela  = telas[0];
                this.controleNavegador.tela = JSON.parse(JSON.stringify(this.tela));
            });

            this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_SELECAO_OBJETO, evento => {

                console.info ("ULTIMA: Recebeu evento seleção objeto");
                console.dir(evento.detail);               

                let novoElemento = {                        
                    "id": this.novoId(this.tela.elementos), 
                    "descricao": "Componente X",
                    "importancia": 10,
                    "componente":{                        
                        "url": "/componentes/editor_json/editor_json.js",
                        "nome": "editor-json"
                    },                    
                    "dados":{...evento.detail.objeto}                        
                };

                this.tela.elementos.push(novoElemento);
                UltimaDAO.getInstance().atualizarTela(this.tela);

                this.controleNavegador.adicionarElemento(novoElemento);                                   
            });

            this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_OBJETO, evento => {
            });
        });
    }

    novoId(elementos){
        let id = 0;
        elementos.forEach(elemento => {
            if (elemento.id > id){
                id = elemento.id;
            }
        });
        return ++id;
    }
}
customElements.define('ultima-view', UltimaView);