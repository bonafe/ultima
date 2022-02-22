export class UltimaEvento extends CustomEvent{

    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO'; 
    static EVENTO_ATUALIZACAO_DADOS = 'EVENTO_ATUALIZACAO_DADOS';
    static EVENTO_ATUALIZACAO_TREEMAP = 'EVENTO_ATUALIZACAO_TREEMAP';

    constructor(evento, objetoDeDados){
        super(evento, {'detail':objetoDeDados, 'bubbles': true, 'composed':true});
    }
}
