import { ComponenteBase } from "../componente_base.js";
import { UltimaEvento, UltimaDAO } from "./ultima.js";
import { ContainerTreeMap } from "../container_treemap/container_treemap.js";

export class UltimaView extends ComponenteBase{    



    constructor(){        
        super({templateURL:"/componentes/ultima/ultima_view.html", shadowDOM:false});
        
        this.addEventListener('carregou', () => {
            
            this.controleNavegador = this.noRaiz.querySelector("container-treemap");
            
            this.querySelector("#reiniciarBanco").addEventListener("click", () => {
                UltimaDAO.getInstance().reiniciarBase().then(() => {
                    //TODO: está recarregando tudo
                    document.location.reload(true);
                });                
            });

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
                    "importancia": this.mediaImportancia(this.tela.elementos),
                    "componente-padrao": "seletor-meses",
                    "componentes": ["seletor-meses", "editor-json"],   
                    "componente":{
                        "url": "/componentes/editor_json/editor_json.js",
                        "nome": "editor-json"
                    },                
                    "dados":{...evento.detail}                        
                };

                console.log (`adicionando novo elemento: ${novoElemento.id}`);

                this.tela.elementos.push(novoElemento);                
                
                //TODO: por algum motivo o número de elementos da variável tela estava mudando
                //Tive que jogar o conteudo copiando por transformação json para conseguir fazer funcionar
                //Acontecia quando usava o mover do treemap ou o aumentar/diminuir e ai adicionava um novo elemento
                //Depois do aguardarBanco() o conteúdo mudava        
                let nt = JSON.parse(JSON.stringify(this.tela)); 


                 //TODO: PQ MUDA O NÚMERO DE ELEMENTOS DE TELA???
                console.log (`TODO: antes do atualizarTela ${this.tela.elementos.length} elementos`);
                console.log (`TODO: antes do atualizarTela COPIA ${nt.elementos.length} elementos`);
                UltimaDAO.getInstance().atualizarTela(this.tela);
                //TODO: PQ MUDA O NÚMERO DE ELEMENTOS DE TELA???
                console.log (`TODO: depois do atualizarTela ${this.tela.elementos.length} elementos`);
                console.log (`TODO: depois do atualizarTela COPIA ${nt.elementos.length} elementos`);

                this.controleNavegador.adicionarElemento(novoElemento);                                                   
            });

            this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_DADOS, evento => {
                let id_elemento = evento.detail.id;
                let elemento = this.tela.elementos.find (elemento => elemento.id == id_elemento);

                console.log (`elemento recebeu novos dados: ${elemento.id}`);

                elemento.dados = evento.detail.dados;
                elemento.componente = evento.detail.componente;
                elemento.descricao = evento.detail.descricao;                

                UltimaDAO.getInstance().atualizarTela(this.tela);
            });

            this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_TREEMAP, evento => {
                console.log (`TREEMAP foi atualizando: ${this.tela.elementos.length} elementos`);
                this.tela = evento.detail.tela;
                UltimaDAO.getInstance().atualizarTela(this.tela);
            });
        });
    }

    mediaImportancia(elementos){
        const soma = elementos.reduce((valorAnterior, elementoAtual) => valorAnterior + elementoAtual.importancia, 0);
        const media = (soma / elementos.length) || 0;
        return media;
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