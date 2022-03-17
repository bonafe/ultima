import { ControladorBase } from "../../../controlador_base.js";
import { UltimaDB } from "../../../ultima/db/ultima_db.js";
import { UltimaDBReader } from "../../../ultima/db/ultima_db_reader.js";
import { UltimaDBWriter } from "../../../ultima/db/ultima_db_writer.js";
import { UltimaEvento } from "../../../ultima/ultima_evento.js";



export class ControladorVisualizadorDiferencasJSON extends ControladorBase{



    constructor(){
        super();
    }



    processarEvento (ultimaEvento){
        console.log (`ControladorVisualizadorDiferencasJSON: processarEvento: %o`, ultimaEvento);
        
        if (ultimaEvento.type == UltimaEvento.EVENTO_VIEW_ATUALIZADA){

            let uuid_view = ultimaEvento.detail.uuid_view;

            UltimaDBReader.getInstance().view(uuid_view)
                .then(view => {                                        
                    for (let indice = 0; indice < view.elementos.length; indice++){
                        let elementoView = view.elementos[indice];                                             
                        if (elementoView.componente == "visualizador-diferencas-json"){
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
                
                UltimaDBReader.getInstance().elemento(elementoView.uuid_elemento)
                    .then(elemento => {
                        elemento.dados = {
                            esquerda: elementoEsquerda.dados,
                            direita: elementoDireita.dados
                        };
                        UltimaDBWriter.getInstance().atualizarElemento(elemento).then(()=>{
                            console.log ("Dados do elemento de diferença foram atualizados!!!!")
                        });
                    });                
            });
        }
    }
}