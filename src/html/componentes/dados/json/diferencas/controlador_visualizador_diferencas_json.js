import { ControladorBase } from "../../../controlador_base.js";
import { UltimaDB } from "../../../ultima/db/ultima_db.js";
import { UltimaDBReader } from "../../../ultima/db/ultima_db_reader.js";
import { UltimaEvento } from "../../../ultima/ultima_evento.js";



export class ControladorVisualizadorDiferencasJSON extends ControladorBase{



    constructor(){
        super();
    }



    processarEvento (ultimaEvento){
        //console.log (`ControladorVisualizadorDiferencasJSON: processarEvento: %o`, ultimaEvento);
        
        //Caso a view tenha sido atualizada        
        if (ultimaEvento.type == UltimaEvento.EVENTO_VIEW_ATUALIZADA){

            let uuid_view = ultimaEvento.detail.uuid_view;

            UltimaDBReader.getInstance().view(uuid_view)
                .then(view => {             
                    
                    //Verifica se existe algum elemento visualizador-diferencas-json
                    for (let indice = 0; indice < view.elementos.length; indice++){
                        let elementoView = view.elementos[indice];                                             
                        if (elementoView.componente == "visualizador-diferencas-json"){

                            //Caso exista, atualiza os dados do visualizador-diferencas-json com os elementos em suas laterais
                            this.atualizarDadosVisualizadorDiferencasJSON(view, elementoView, indice);                            
                        }
                    }                 
                });               
        }        
    }



    atualizarDadosVisualizadorDiferencasJSON(view, elementoView, indice){

        let elementoViewEsquerda = ((indice == 0) ? undefined : view.elementos[indice-1]);
        let elementoViewDireita = ((indice == (view.elementos.lenght-1)) ? undefined : view.elementos[indice+1]);

        if (!elementoViewEsquerda){
            elementoViewEsquerda = elementoViewDireita;
        }
        if (!elementoViewDireita){
            elementoViewDireita = elementoViewEsquerda;
        }

        if (elementoViewEsquerda && elementoViewDireita){

            Promise.all([
                UltimaDBReader.getInstance().elemento(elementoViewEsquerda.uuid_elemento),
                UltimaDBReader.getInstance().elemento(elementoViewDireita.uuid_elemento)
            ]).then (retornos => {
                const [elementoEsquerda, elementoDireita] = retornos;
                               

                    let dados = {
                        esquerda: elementoEsquerda.dados,
                        direita: elementoDireita.dados
                    };

                    let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_ELEMENTO, {                                    
                        uuid_elemento:elementoView.uuid_elemento,
                        uuid_view:view.uuid,
                        uuid_elemento_view:elementoView.uuid,
                        dados:JSON.parse(JSON.stringify(dados))
                    });                                

                    this.dispatchEvent(eventoCompleto);                     
            });
        }
    }
}