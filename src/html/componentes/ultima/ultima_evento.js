export class UltimaEvento extends CustomEvent{

    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO'; 
    
    static EVENTO_ATUALIZACAO_COMPONENTE = 'EVENTO_ATUALIZACAO_COMPONENTE';
    static EVENTO_ATUALIZACAO_ELEMENTO = 'EVENTO_ATUALIZACAO_ELEMENTO';
    static EVENTO_ATUALIZACAO_VIEW = 'EVENTO_ATUALIZACAO_VIEW';

    static EVENTO_PLAYER_YOUTUBE_CARREGADO = 'EVENTO_PLAYER_YOUTUBE_CARREGADO';

    constructor(evento, objetoDeDados){
        super(evento, {'detail':objetoDeDados, 'bubbles': true, 'composed':true});
    }
}
