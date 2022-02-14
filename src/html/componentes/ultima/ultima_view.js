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
                    "id": this.proximoIdElemento(this.tela.elementos), 
                    "ordem": this.proximaOrdem(this.tela.elementos),
                    "descricao": "Componente X",
                    "importancia": 10,
                    "componente":{                        
                        "url": "/componentes/editor_json/editor_json.js",
                        "nome": "editor-json"
                    },                    
                    "dados":{...evento.detail.objeto}                        
                };

                this.tela.elementos.push(novoElemento);

                //Todo: tratamento de erro???
                UltimaDAO.getInstance().atualizarTela(this.tela);

                this.controleNavegador.adicionarElemento(novoElemento);                                   
            });

            this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_OBJETO, evento => {
                let id_elemento = evento.detail.objeto.id;
                let elemento = this.tela.elementos.find (elemento => elemento.id == id_elemento);

                elemento.dados = evento.detail.objeto.dados.novoValor;
                elemento.componente = evento.detail.objeto.componente;
                elemento.descricao = evento.detail.objeto.descricao;
                elemento.importancia = evento.detail.objeto.importancia;
                elemento.ordem = evento.detail.objeto.ordem;

                UltimaDAO.getInstance().atualizarTela(this.tela);
            });
        });
    }

    proximoIdElemento(elementos){
        let id = 0;
        elementos.forEach(elemento => {
            if (elemento.id > id){
                id = elemento.id;
            }
        });
        return ++id;
    }

    proximaOrdem(elementos){
        let ordem = 0;
        elementos.forEach(elemento => {
            if (elemento.ordem > ordem){
                ordem = elemento.ordem;
            }
        });
        ++ordem;

        console.log(ordem);

        return ordem;
    }
}
customElements.define('ultima-view', UltimaView);