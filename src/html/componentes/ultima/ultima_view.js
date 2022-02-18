import { ComponenteBase } from "../componente_base.js";
import { UltimaEvento, UltimaDAO } from "./ultima.js";
import { ContainerTreeMap } from "../container_treemap/container_treemap.js";

export class UltimaView extends ComponenteBase{    



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

                let novoElemento = {                        
                    "id": this.proximoIdElemento(this.tela.elementos), 
                    "ordem": this.proximaOrdem(this.tela.elementos),
                    "descricao": "Componente X",
                    "importancia": 10,
                    "componente-padrao": "seletor-meses",
                    "componentes": ["seletor-meses", "editor-json"],                   
                    "dados":{...evento.detail}                        
                };

                this.tela.elementos.push(novoElemento);                

                //Todo: tratamento de erro???
                UltimaDAO.getInstance().atualizarTela(this.tela);

                this.controleNavegador.adicionarElemento(novoElemento);                                   
            });

            this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_DADOS, evento => {
                let id_elemento = evento.detail.id;
                let elemento = this.tela.elementos.find (elemento => elemento.id == id_elemento);

                elemento.dados = evento.detail.dados;
                elemento.componente = evento.detail.componente;
                elemento.descricao = evento.detail.descricao;                

                UltimaDAO.getInstance().atualizarTela(this.tela);
            });

            this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_TREEMAP, evento => {
                this.tela = evento.detail.tela;
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

        return ordem;
    }
}
customElements.define('ultima-view', UltimaView);