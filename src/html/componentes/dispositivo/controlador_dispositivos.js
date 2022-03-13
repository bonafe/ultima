import { ControladorBase } from "../controlador_base.js";
import { UltimaDB } from "../ultima/db/ultima_db.js";
import { UltimaDBReader } from "../ultima/db/ultima_db_reader.js";
import { UltimaEvento } from "../ultima/ultima_evento.js";

export class ControladorDispositivos extends ControladorBase{

    constructor(){
        super();
    }

    processarEvento (ultimaEvento){
        console.log (`ControladorDispositivos: processarEvento: %o`, ultimaEvento);

        //REGRA: EVENTO SELEÇÃO DE OBJETO
        if (ultimaEvento.type == UltimaEvento.EVENTO_SELECAO_OBJETO){

            UltimaDBReader.getInstance().elemento_view(ultimaEvento.detail.id_view_origem, ultimaEvento.detail.id_elemento_view_origem)

                .then(elementoView => {
                    
                    //REGRA: Vinda de um componente do tipo exibidor-dispositivos
                    if (elementoView.componente == "exibidor-dispositivos"){
                        
                        let componente = undefined;
                        if (ultimaEvento.detail.dados.kind == "videoinput"){
                            componente = "exibidor-camera";

                        }else if (['audioinput', 'audiooutput'].indexOf(ultimaEvento.detail.dados.kind) != -1) {
                            componente = "visualizador-som";
                        }

                        if (componente){
                            UltimaEvento.dispararEventoExecutarAcao(this, 
                                UltimaEvento.ACAO_ADICIONAR_ELEMENTO.nome, 
                                {
                                    "nome_elemento": "Nova exibição dispositivo",
                                    "nome_componente": componente,
                                    "dados": ultimaEvento.detail.dados
                                }
                            );
                        } 
                        
                    }                    
                });
        }
    }
}