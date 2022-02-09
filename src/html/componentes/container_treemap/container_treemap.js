import { ComponenteBase } from '../componente_base.js';
import { ElementoTreeMap } from './elemento_treemap.js';
import { UltimaEvento } from '../ultima/ultima.js';


export class ContainerTreeMap extends ComponenteBase{


    constructor(){
        super({templateURL:"/componentes/container_treemap/container_treemap.html", shadowDOM:false});        

        this._elementos = {};

        this.addEventListener("carregou", () => {

            this.container = this.noRaiz.querySelector("#containerTreeMap");
            this.renderizar();
        });        
    }



    processarNovasDimensoes(largura, altura){
        
        this.renderizar();
    }



    renderizar() {

        if (this.container && this._elementos){

            if (!this.node){
                this.criarTreeMap();
            }else{
                this.atualizarTreeMap();
            }
        }
    }


    criarRaizHierarquicaD3JS(elementos){
        this._elementos["telas"][0]["elementos"].forEach ((elemento, indice) => elemento["ordem"] = indice);
        return d3.hierarchy(elementos, (d) => (d.telas ? d.telas : d.elementos)).sum((d) => d.importancia)
                .sort((a, b) =>{                    
                     return (a.ordem - b.ordem);
                });;
    }


    adicionarElementos(elementos){                                  

        //Cria e adicionar um elemento
        //TODO: está adicionar em lugar fixo, deveria ser relativo a quem acionou aquele adicionar                
        elementos["id"] = this._elementos["proximoId"];
        this._elementos["proximoId"] += 1;
        this._elementos["telas"][0]["elementos"].push(elementos);
        
        //TODO: não pode criar, tem que atualizar, código abaixo não estã funcionando
        this.criarTreeMap();

        /*
        const div = d3.select(this.container).select("div");

        const root = this.criarRaizHierarquicaD3JS(elementos);
                
        const node = div.datum(root).selectAll(".node")
            .data(this.treemap(root).leaves())
                .enter().append("elemento-treemap")
                    .attr("class", "node container")
                    .attr("id",(d) => JSON.stringify(d.data.id))
                    .attr("componente",(d) => JSON.stringify(d.data.componente))
                    .attr("dados",(d) => JSON.stringify(d.data.dados))                        
                    .style("left", (d) => d.x0 + "px")
                    .style("top", (d) => d.y0 + "px")
                    .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
                    .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px"); 
        */
    }


    criarTreeMap(){

        const margin = {top: 0, right: 0, bottom: 0, left: 0};
        const width = this.container.clientWidth - margin.left - margin.right;
        const height = this.container.clientHeight - margin.top - margin.bottom;
        const color = d3.scaleOrdinal().range(d3.schemeCategory20c);
    
        d3.select(this.container).selectAll("div").remove();
    
        this.treemap = d3.treemap().size([width, height]);

        const div = d3.select(this.container).append("div")
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right) + "px")
            .style("height", (height + margin.top + margin.bottom) + "px")
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");
        
        const root = this.criarRaizHierarquicaD3JS(this._elementos);        
            
        this.node = div.datum(root).selectAll(".node")
            .data(this.treemap(root).leaves())
                .enter().append("elemento-treemap")
                    .attr("class", "node container")
                    .attr("id",(d) => JSON.stringify(d.data.id))
                    .attr("componente",(d) => JSON.stringify(d.data.componente))
                    .attr("dados",(d) => JSON.stringify(d.data.dados))                        
                    .style("left", (d) => d.x0 + "px")
                    .style("top", (d) => d.y0 + "px")
                    .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
                    .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px");                            
                    
        //TODO: levar listeners para dentro do adicionar elementos
        this.noRaiz.querySelectorAll("elemento-treemap").forEach((elementoTreemap, indice) =>
        {                        
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_AUMENTAR, (evento) => {
                let idElementoProcurado = evento.detail;
                let elemento = this.elementos["telas"][0]["elementos"].find (elemento => elemento.id == idElementoProcurado);
                //TODO: Tamanho máximo???
                elemento.importancia *= 1.5;
                this.atualizarTreeMap();                  
            });
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_DIMINUIR, (evento) => {
                let idElementoProcurado = evento.detail;
                let elemento = this.elementos["telas"][0]["elementos"].find (elemento => elemento.id == idElementoProcurado);
                //TODO: Tamanho mínimo???
                elemento.importancia *= 0.50;
                this.atualizarTreeMap();   
            });     
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_IR_PARA_TRAS, (evento) => {
                let idElementoProcurado = evento.detail;
                let indice = this.elementos["telas"][0]["elementos"].map(e => e.id).indexOf (idElementoProcurado);

                if (indice > 0){

                    //Remove o elemento da posição
                    let [elemento] = this.elementos["telas"][0]["elementos"].splice(indice,1);
                    //O recoloca em uma posição anterior
                    this.elementos["telas"][0]["elementos"].splice(indice-1,0,elemento);
                        
                    this.criarTreeMap();   
                }
            }); 
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_IR_PARA_FRENTE, (evento) => {
                let idElementoProcurado = evento.detail;
                let indice = this.elementos["telas"][0]["elementos"].map(e => e.id).indexOf (idElementoProcurado);
                
                if (indice < (this.elementos["telas"][0]["elementos"].length-1)){
                    
                    //Remove o elemento da posição
                    let [elemento] = this.elementos["telas"][0]["elementos"].splice(indice,1);                    
                    //O recoloca em uma posição posterior
                    this.elementos["telas"][0]["elementos"].splice(indice+1,0,elemento);
                        
                    this.criarTreeMap();   
                }
            });     
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_IR_PARA_INICIO, (evento) => {
                let idElementoProcurado = evento.detail;
                let indice = this.elementos["telas"][0]["elementos"].map(e => e.id).indexOf (idElementoProcurado);

                if (indice > 0){

                    //Remove o elemento da posição
                    let [elemento] = this.elementos["telas"][0]["elementos"].splice(indice,1);
                    //O recoloca no inicio
                    this.elementos["telas"][0]["elementos"].splice(0,0,elemento);
                        
                    this.criarTreeMap();   
                }
            });   
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_IR_PARA_FIM, (evento) => {
                let idElementoProcurado = evento.detail;
                let indice = this.elementos["telas"][0]["elementos"].map(e => e.id).indexOf (idElementoProcurado);

                if (indice < (this.elementos["telas"][0]["elementos"].length-1)){

                    //Remove o elemento da posição
                    let [elemento] = this.elementos["telas"][0]["elementos"].splice(indice,1);
                    //O recoloca no final
                    this.elementos["telas"][0]["elementos"].splice(this.elementos["telas"][0]["elementos"].length,0,elemento);
                        
                    this.criarTreeMap();   
                }
            });  
              
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_MUDAR_VISUALIZACAO, (evento) => {
                this.atualizarTreeMap();
            });
        });
    }



    atualizarTreeMap(){

        const margin = {top: 0, right: 0, bottom: 0, left: 0};
        const width = this.container.clientWidth - margin.left - margin.right;
        const height = this.container.clientHeight - margin.top - margin.bottom;
        const color = d3.scaleOrdinal().range(d3.schemeCategory20c);            
    
        this.treemap = d3.treemap().size([width, height]);                            

        const root = this.criarRaizHierarquicaD3JS(this._elementos); 

        this.node.data(this.treemap(root).leaves())
            .transition()
                .duration(500)
                .style("left", d => `${d.x0}px`)
                .style("top", d => `${d.y0}px`)
                .style('width', d => `${Math.max(0, d.x1 - d.x0 -1)}px`)
                .style('height', d => `${Math.max(0, d.y1 - d.y0 -1)}px`);
    }



    encontrarComponente(componente){

    }

    set elementos(novoValor){
        this._elementos = novoValor;
        this.renderizar();
    }

    get elementos(){
        return this._elementos;
    }

    static get observedAttributes() {
        return ['elementos'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

        //Atributo componente é usado pelo ElementoTreeMap para definir qual componente renderizar
        if (nomeAtributo.localeCompare("elementos") == 0){

            this._elementos = JSON.parse(novoValor);
            this.renderizar();
        }
    }
}

customElements.define('container-treemap', ContainerTreeMap);