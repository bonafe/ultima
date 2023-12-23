export class Evento extends CustomEvent{

    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO'; 
    
    //Indica que houver alguma atualização em elemento
    static EVENTO_ATUALIZACAO_ELEMENTO = 'EVENTO_ATUALIZACAO_ELEMENTO';    
    //Indica que o elemento foi atualizado na base de dados
    static EVENTO_ELEMENTO_ATUALIZADO = 'EVENTO_ELEMENTO_ATUALIZADO';    

    //Indica que houver alguma atualização na visualizacao
    static EVENTO_ATUALIZACAO_VISUALIZACAO = 'EVENTO_ATUALIZACAO_VISUALIZACAO';    
    //Indica que a visualizacao foi atualizada na base de dados
    static EVENTO_VISUALIZACAO_ATUALIZADA = 'EVENTO_VISUALIZACAO_ATUALIZADA';    

    static EVENTO_PLAYER_YOUTUBE_CARREGADO = 'EVENTO_PLAYER_YOUTUBE_CARREGADO';


    static EXECUTAR_ACAO = 'EVENTO_EXECUTAR_ACAO';

    

    static ACAO_REINICIAR = {
        nome:'ACAO_REINICIAR'
    };
    
    static ACAO_ADICIONAR_ELEMENTO = {
        nome:'ACAO_ADICIONAR_ELEMENTO',
        parametros:{
            nome_elemento: undefined,
            nome_componente: undefined,
            dados: undefined
        }
    };
    static ACAO_AUMENTAR_ELEMENTO = {
        nome:'ACAO_AUMENTAR_ELEMENTO',
        parametros:{
            id_elemento_view: undefined
        }
    };
    static ACAO_DIMINUIR_ELEMENTO = {
        nome:'ACAO_DIMINUIR_ELEMENTO',
        parametros:{
            id_elemento_view: undefined
        }
    }

    static ACAO_IR_PARA_TRAS_ELEMENTO = {
        nome:'ACAO_IR_PARA_TRAS_ELEMENTO',
        parametros:{
            id_elemento_view: undefined
        }
    }

    static ACAO_IR_PARA_FRENTE_ELEMENTO = {
        nome:'ACAO_IR_PARA_FRENTE_ELEMENTO',
        parametros:{
            id_elemento_view: undefined
        }
    }

    static ACAO_IR_PARA_INICIO_ELEMENTO = {
        nome:'ACAO_IR_PARA_INICIO_ELEMENTO',
        parametros:{
            id_elemento_view: undefined
        }
    }
    
    static ACAO_IR_PARA_FIM_ELEMENTO = {
        nome:'ACAO_IR_PARA_FIM_ELEMENTO',
        parametros:{
            id_elemento_view: undefined
        }
    }
    static ACAO_MAXIMIZAR_ELEMENTO = {
        nome:'ACAO_MAXIMIZAR_ELEMENTO',
        parametros:{
            id_elemento_view: undefined
        }
    }
    static ACAO_MINIMIZAR_ELEMENTO = {
        nome:'ACAO_MINIMIZAR_ELEMENTO',
        parametros:{
            id_elemento_view: undefined
        }
    }
    static ACAO_RESTAURAR_ELEMENTO = {
        nome:'ACAO_RESTAURAR_ELEMENTO',
        parametros:{
            id_elemento_view: undefined
        }
    }
    static ACAO_FECHAR_ELEMENTO = {
        nome:'ACAO_FECHAR_ELEMENTO',
        parametros:{
            id_elemento_view: undefined
        }
    }
    


    static ACOES = {
        [Evento.ACAO_ADICIONAR_ELEMENTO.nome]:Evento.ACAO_ADICIONAR_ELEMENTO,
        [Evento.ACAO_AUMENTAR_ELEMENTO.nome]:Evento.ACAO_AUMENTAR_ELEMENTO,
        [Evento.ACAO_DIMINUIR_ELEMENTO.nome]:Evento.ACAO_DIMINUIR_ELEMENTO,
        [Evento.ACAO_IR_PARA_TRAS_ELEMENTO.nome]:Evento.ACAO_IR_PARA_TRAS_ELEMENTO,
        [Evento.ACAO_IR_PARA_FRENTE_ELEMENTO.nome]:Evento.ACAO_IR_PARA_FRENTE_ELEMENTO,
        [Evento.ACAO_IR_PARA_INICIO_ELEMENTO.nome]:Evento.ACAO_IR_PARA_INICIO_ELEMENTO,
        [Evento.ACAO_IR_PARA_FIM_ELEMENTO.nome]:Evento.ACAO_IR_PARA_FIM_ELEMENTO,
        [Evento.ACAO_MAXIMIZAR_ELEMENTO.nome]:Evento.ACAO_MAXIMIZAR_ELEMENTO,
        [Evento.ACAO_MINIMIZAR_ELEMENTO.nome]:Evento.ACAO_MINIMIZAR_ELEMENTO,
        [Evento.ACAO_RESTAURAR_ELEMENTO.nome]:Evento.ACAO_RESTAURAR_ELEMENTO,
        [Evento.ACAO_FECHAR_ELEMENTO.nome]:Evento.ACAO_FECHAR_ELEMENTO
    };



    static dispararEventoExecutarAcao(emissor, nome_acao, parametros){
        emissor.dispatchEvent (new Evento(
            Evento.EXECUTAR_ACAO, 
            Evento.criarAcao(nome_acao, parametros)));
    }
    
    static criarAcao (nome_acao, parametros){
        return {
            'nome': nome_acao,
            'parametros': parametros
        }
    }
    


    constructor(evento, objetoDeDados){
        //Configurado para o evento ser propagado pela hierarquia de elementos: 'bubbles':true    
        //Configurado para ser enviado para fora da ShadowDom: 'composed':true
        super(evento, {'detail':objetoDeDados, 'bubbles': true, 'composed':true});
    }
}
