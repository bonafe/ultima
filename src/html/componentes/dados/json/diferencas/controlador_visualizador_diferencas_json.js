import { ControladorBase } from "../../../controlador_base.js";
import { LeitorEspacoDB } from "../../../espaco/modelo/leitor_espaco_db.js";
import { Evento } from "../../../espaco/evento.js";



export class ControladorVisualizadorDiferencasJSON extends ControladorBase{



    constructor(){
        super();
    }



    processarEvento (Evento){
        //console.log (`ControladorVisualizadorDiferencasJSON: processarEvento: %o`, Evento);
        
        //Caso a visualizacao tenha sido atualizada        
        if (Evento.type == Evento.EVENTO_VISUALIZACAO_ATUALIZADA){

            let uuid_visualizacao = Evento.detail.uuid_visualizacao;

            LeitorEspacoDB.getInstance().visualizacao(uuid_visualizacao)
                .then(visualizacao => {             
                    
                    //Verifica se existe algum elemento visualizador-diferencas-json
                    for (let indice = 0; indice < visualizacao.elementos.length; indice++){
                        let elementoView = visualizacao.elementos[indice];                                             
                        if (elementoView.componente == "visualizador-diferencas-json"){

                            //Caso exista, atualiza os dados do visualizador-diferencas-json com os elementos em suas laterais
                            this.atualizarDadosVisualizadorDiferencasJSON(visualizacao, elementoView, indice);                            
                        }
                    }                 
                });               
        }        
    }



    atualizarDadosVisualizadorDiferencasJSON(visualizacao, elementoView, indice){

        let elementoViewEsquerda = ((indice == 0) ? undefined : visualizacao.elementos[indice-1]);
        let elementoViewDireita = ((indice == (visualizacao.elementos.lenght-1)) ? undefined : visualizacao.elementos[indice+1]);

        if (!elementoViewEsquerda){
            elementoViewEsquerda = elementoViewDireita;
        }
        if (!elementoViewDireita){
            elementoViewDireita = elementoViewEsquerda;
        }

        if (elementoViewEsquerda && elementoViewDireita){

            Promise.all([
                LeitorEspacoDB.getInstance().elemento(elementoViewEsquerda.uuid_elemento),
                LeitorEspacoDB.getInstance().elemento(elementoViewDireita.uuid_elemento)
            ]).then (retornos => {
                const [elementoEsquerda, elementoDireita] = retornos;
                               

                    let dados = {
                        esquerda: elementoEsquerda.dados,
                        direita: elementoDireita.dados
                    };

                    let eventoCompleto = new Evento(Evento.EVENTO_ATUALIZACAO_ELEMENTO, {                                    
                        uuid_elemento:elementoView.uuid_elemento,
                        uuid_visualizacao:visualizacao.uuid,
                        uuid_elemento_visualizacao:elementoView.uuid,
                        dados:structuredClone(dados)
                    });                                

                    this.dispatchEvent(eventoCompleto);                     
            });
        }
    }
}