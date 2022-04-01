import { ComponenteBase } from '../../componente_base.js';
import { UltimaEvento } from '../ultima_evento.js';
import { UltimaDBReader } from "../db/ultima_db_reader.js";



export class UltimaView extends ComponenteBase{

    

    constructor(){
        super({templateURL:"./ultima_view.html", shadowDOM:false}, import.meta.url);        

        this._view = undefined;

        this.addEventListener("carregou", () => {

            this.container = this.noRaiz.querySelector(".componente_navegacao_view");

            this.atualizarDimensoes();            

            this.renderizar();
        });        
    }



    atualizarDimensoes(){
        if (this.container){
            this.marginTreemap = {top: 0, right: 0, bottom: 0, left: 0};
            this.widthTreemap = this.container.clientWidth - this.marginTreemap.left - this.marginTreemap.right;
            this.heightTreemap = this.container.clientHeight - this.marginTreemap.top - this.marginTreemap.bottom;
            this.colorTreemap = d3.scaleOrdinal().range(d3.schemeCategory20c);
        }
    }



    renderizar() {      

        if (this.carregado && !this.renderizado && this._view){
            this.criarEIniciarMenuDeAcoes();
            this.renderizado = true;
        }
    }    


    
    criarEIniciarMenuDeAcoes(){

        let menuAcoes = this.noRaiz.querySelector("#menuAcoes");
        menuAcoes.innerHTML = "";

        this.querySelector("#reiniciar").addEventListener("click", () => {
            UltimaEvento.dispararEventoExecutarAcao(this, UltimaEvento.ACAO_REINICIAR.nome);               
        });

        Promise.all(this._view.acoes.map(idAcao => UltimaDBReader.getInstance().acao(idAcao)))
            .then (acoes => {
                acoes.forEach (acao => {
                    let a = document.createElement("a");
                    a.href = "#";
                    a.textContent = acao.titulo;
                    menuAcoes.appendChild(a);

                    a.addEventListener("click", e => {
                        UltimaEvento.dispararEventoExecutarAcao(this, 
                            acao.nome_acao, 
                            {
                                nome_elemento:acao.dados.nome_elemento,
                                nome_componente:acao.dados.nome_componente,
                                dados:acao.dados.dados
                            });                         
                    });
                });
            });        
    }



    adicionarElemento(elemento){                                          

        this._view.elementos.push(JSON.parse(JSON.stringify(elemento)));
                               
        this.renderizar();    
    }



    set view(novaview){        
        this._view = JSON.parse(JSON.stringify(novaview));
        this.renderizar();
    }



    get view(){
        return this._view;
    }



    static get observedAttributes() {
        return ['view'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

        //Atributo componente é usado pelo ElementoTreeMap para definir qual componente renderizar
        if (nomeAtributo.localeCompare("view") == 0){

            this._view = JSON.parse(novoValor);
            this.renderizar();
        }       
    }



    processarNovasDimensoes(largura, altura){

        //console.info (`--------------------------------> ATUALIZOU DIMENSÕES DO CONTAINER TREEMAP`);

        this.atualizarDimensoes();
        this.renderizar();
    }



    substituirElementoContainer(elementoContainer) {
        
        let evento = d3.event;

        //Para a propagaçaõ do evento do componente
        evento.stopPropagation();

        let elemento_view_atualizado = evento.detail;

        let indice = this.view.elementos.map(e => e.uuid).indexOf (elemento_view_atualizado.uuid);

        //Remove o elemento da posição
        let [elemento] = this.view.elementos.splice(indice,1);

        //Coloca o elemento atualizado no lugar
        this.view.elementos.splice(indice,0,elemento_view_atualizado);  

        this.salvarView();                           
    }
}