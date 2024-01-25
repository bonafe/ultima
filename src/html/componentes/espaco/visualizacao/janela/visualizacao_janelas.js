import { Visualizacao } from '../visualizacao.js';

import { ElementoJanela } from './elemento_janela.js';
import { Evento } from '../../evento.js';
import { ComponenteBase } from '../../../componente_base.js';


export class VisualizacaoJanelas extends Visualizacao{


    constructor(){
        super();        

        this.paineis = [];

        this.visualizacaoJanelaRenderizado = false;

        this.addEventListener("carregou", () => {            

            Promise.all([
                super.carregarCSS("../../../../bibliotecas/jspanel/jspanel.css"),
                super.carregarScript({src:"../../../../bibliotecas/jspanel/jspanel.js"})
            ]).then (() => {
                this.container = this.noRaiz.querySelector(".componente_navegacao_visualizacao");

                //Precisa escutar o evento no document
                document.addEventListener("jspaneldragstop", evento => {

                    let indice = this.visualizacao.elementos.map(e => e.uuid).indexOf (evento.panel.uuid);

                    let elemento = this.visualizacao.elementos[indice];

                    elemento["offsetLeft"] = evento.panel.offsetLeft;
                    elemento["offsetTop"] = evento.panel.offsetTop;

                    console.log(`Drag Stop: ${evento.panel.uuid}: ${evento.panel.offsetLeft}-${evento.panel.offsetTop}`);

                    this.dispatchEvent(new Evento(Evento.EVENTO_ATUALIZACAO_VISUALIZACAO,{uuid_visualizacao:this.visualizacao.uuid})); 
                    
                }, false);
                document.addEventListener("jspanelresizestop", evento => {
                    console.log(`Resize Stop: ${evento.panel.uuid}: ${evento.panel.offsetWidth}-${evento.panel.offsetHeight}`);
                }, false);


                this.renderizar();
            });                   
        });        
    }



    remover(){
        this.paineis.forEach(painel => painel.close());
        this.paineis = [];
        super.remover();
    }



    get paineis(){  
        return this._paineis;
    }
    


    set paineis(paineis){
        this._paineis = paineis;
    }



    renderizar() {

        if (this.container && this._visualizacao && !this.visualizacaoJanelaRenderizado){

            //Atualiza o atributo ordem do elemento
            this._visualizacao.elementos.forEach ((elemento, indice) => elemento.ordem = indice);

            this.visualizacao.elementos.forEach (elemento => {
                this.criarPainel(elemento);
            });

            this.visualizacaoJanelaRenderizado = true;
        }
        super.renderizar();
    }
    

    adicionarElemento(elemento){                                          

        let copiaElemento = structuredClone(elemento);

        this._visualizacao.elementos.push(copiaElemento);
                               
        this.criarPainel(copiaElemento);
    }



    atualizarElemento(uuid_elemento){

        let seletor = `elemento-janela[uuid_elemento="${uuid_elemento}"]`;
        
        let elementos = this.noRaiz.querySelectorAll(seletor);
        
        console.log (`ATUALIZANDO ELEMENTOS visualizacao COM O ELEMENTO PROCURADP: quantidade ${elementos.length}`);

        elementos.forEach(elemento_janela => elemento_janela.atualizar());        
    }





    criarPainel(elemento){
        let painel = jsPanel.create({
            id: `visualizacao_do_Espaco_em_janela_painel_${elemento.uuid}`,
            theme: 'dark',
            headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
            headerTitle: 'Título Elemento visualizacao',
            headerToolbar: '<span class="text-sm">Just some text in optional header toolbar ...</span>',
            footerToolbar: '<span class="flex flex-grow">You can have a footer toolbar too</span>'+
                           '<i class="fal fa-clock mr-2"></i><span class="clock">loading ...</span>',
            panelSize: {
                width: () => { return Math.min(800, window.innerWidth*0.9);},
                height: () => { return Math.min(500, window.innerHeight*0.6);}
            },
            animateIn: 'jsPanelFadeIn',
            onwindowresize: true,
            callback: painel => {
                let elemento = document.createElement("elemento-janela");                
                elemento.setAttribute("uuid_elemento_visualizacao",elemento.uuid)
                elemento.setAttribute("uuid_visualizacao", this.visualizacao.uuid)                    
                elemento.setAttribute("uuid_elemento", elemento.uuid_elemento)
                painel.content.appendChild(elemento);
                painel.uuid = elemento.uuid;
            },            
        });

        this.paineis.push(painel);
    }


    encontrarEAplicarMudanca(idElementoProcurado, funcaoDeMudanca){
                
        let indice = this.visualizacao.elementos.map(e => e.uuid).indexOf (idElementoProcurado);

        let elemento = this.visualizacao.elementos[indice];

        //Aqui é um caso interessante pois é usado o operador !== false porque o normal é não ser false        
        //Se der algum erro na funcaoDeMudanca ela vai explicitamente retornar false
        //Normalmente undefined é avaliado como falso em uma comparação normal,
        //nesse caso undefined precisa ser tratado como um retorno verdadeiro
        if (funcaoDeMudanca(elemento, indice) !== false){
        
            this.renderizar();                  
            this.dispatchEvent(new Evento(Evento.EVENTO_ATUALIZACAO_VISUALIZACAO,{uuid_visualizacao:this.visualizacao.uuid})); 
        }
    }



    aumentar(propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_visualizacao, elemento => {
            elemento.importancia *= 1.5;   
        });
    }




    diminuir (propriedades) {        
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_visualizacao, elemento => {
            elemento.importancia *= 0.50;  
        });
    }



    maximizar (propriedades) {

        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_visualizacao, elemento => {

            let somaImportanciaOutros = this.visualizacao.elementos.reduce ((valorAnterior, elementoAtual) => {
                if (elementoAtual.uuid != elemento.uuid){                        
                    return valorAnterior + elementoAtual.importancia;
                }else{
                    return valorAnterior;
                }
            },0);
           
            elemento.importancia = somaImportanciaOutros;
        });
    }



    minimizar (propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_visualizacao, elemento => {

            let menorImportancia = this.visualizacao.elementos.reduce ((valorAnterior, elementoAtual) => {
                if (elementoAtual.importancia < valorAnterior){
                    return elementoAtual.importancia;
                }else{
                    return valorAnterior;
                }
            },Number.MAX_VALUE);
            
            elemento.importancia = menorImportancia;
        });
    }



    restaurar (propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_visualizacao, elemento => {

            let somaImportancia = this.visualizacao.elementos.reduce ((valorAnterior, elementoAtual) => {                    
                return valorAnterior + elementoAtual.importancia;                    
            },0);
            
            const mediaImportancia = somaImportancia / this.visualizacao.elementos.length || 0;

            elemento.importancia = mediaImportancia;
        });
    }



    fechar (propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_visualizacao, (elemento, indice) => {

            if (indice >= 0){

                //Remove o elemento da posição
                let [elemento] = this.visualizacao.elementos.splice(indice,1);                                                        

            }else{

                //Não executa atualização
                return false;
            }
        });
    }



    irParaTras(propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_visualizacao, (elemento, indice) => {

            if (indice > 0){

                //Remove o elemento da posição
                let [elemento] = this.visualizacao.elementos.splice(indice,1);
                //O recoloca em uma posição anterior
                this.visualizacao.elementos.splice(indice-1,0,elemento);                                        
                
            }else{

                //Não executa atualização
                return false;
            }
        });
    }



    irParaFrente(propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_visualizacao, (elemento, indice) => {
        
            if (indice < (this.visualizacao.elementos.length-1)){
                
                //Remove o elemento da posição
                let [elemento] = this.visualizacao.elementos.splice(indice,1);                    
                //O recoloca em uma posição posterior
                this.visualizacao.elementos.splice(indice+1,0,elemento);                                        
                         
            }else{

                //Não executa atualização
                return false;
            }
        });
    }



    irParaFim(propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_visualizacao, (elemento, indice) => {
        
            if (indice < (this.visualizacao.elementos.length-1)){

                //Remove o elemento da posição
                let [elemento] = this.visualizacao.elementos.splice(indice,1);
                //O recoloca no final
                this.visualizacao.elementos.splice(this.visualizacao.elementos.length,0,elemento);
                                                    
            }else{

                //Não executa atualização
                return false;
            }
        });
    }



    irParaInicio(propriedades) {

        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_visualizacao, (elemento, indice) => {
        
        if (indice > 0){

            //Remove o elemento da posição
            let [elemento] = this.visualizacao.elementos.splice(indice,1);
            //O recoloca no inicio
            this.visualizacao.elementos.splice(0,0,elemento);                       

           }else{

                //Não executa atualização
                return false;
            }
        });
    }
}

customElements.define('visualizacao-janelas', VisualizacaoJanelas);