export class UltimaEvento extends CustomEvent{
    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO'; 

    constructor(evento, objetoDeDados){
        super(evento, {'detail':{'objeto':objetoDeDados}, 'bubbles': true, 'composed':true});
    }
}