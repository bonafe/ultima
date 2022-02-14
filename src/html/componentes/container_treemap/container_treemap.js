import { ComponenteBase } from '../componente_base.js';
import { ElementoTreeMap } from './elemento_treemap.js';
import { UltimaEvento } from '../ultima/ultima.js';


export class ContainerTreeMap extends ComponenteBase{


    constructor(){
        super({templateURL:"/componentes/container_treemap/container_treemap.html", shadowDOM:false});        

        this._tela = undefined;

        this.addEventListener("carregou", () => {

            this.container = this.noRaiz.querySelector("#containerTreeMap");
            this.renderizar();
        });        
    }



    processarNovasDimensoes(largura, altura){
        
        this.renderizar();
    }



    renderizar() {

        if (this.container && this._tela){

            if (!this.node){
                this.criarTreeMap();
            }else{
                this.atualizarTreeMap();
            }
        }
    }


    atualizarOrdemElementos(tela){
        tela.elementos.forEach ((elemento, indice) => elemento["ordem"] = indice);
    }


    criarRaizHierarquicaD3JS(tela){
        
        this.atualizarOrdemElementos(tela);

        return d3.hierarchy(tela, (d) => d.elementos).sum((d) => d.importancia)
                .sort((a, b) =>{                    
                     return (a.ordem - b.ordem);
                });;
    }


    adicionarElemento(elemento){                                  
                
        this._tela.elementos.push(elemento);
        
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
        
        const root = this.criarRaizHierarquicaD3JS(this.tela);        
            
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
                let elemento = this.tela.elementos.find (elemento => elemento.id == idElementoProcurado);
                //TODO: Tamanho máximo???
                elemento.importancia *= 1.5;

                this.atualizouElementoTreemap(elemento);

                this.atualizarTreeMap();                  
            });
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_DIMINUIR, (evento) => {
                let idElementoProcurado = evento.detail;
                let elemento = this.tela.elementos.find (elemento => elemento.id == idElementoProcurado);
                //TODO: Tamanho mínimo???
                elemento.importancia *= 0.50;

                this.atualizouElementoTreemap(elemento);

                this.atualizarTreeMap();   
            });     
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_IR_PARA_TRAS, (evento) => {
                let idElementoProcurado = evento.detail;
                let indice = this.tela.elementos.map(e => e.id).indexOf (idElementoProcurado);

                if (indice > 0){

                    //Remove o elemento da posição
                    let [elemento] = this.tela.elementos.splice(indice,1);
                    //O recoloca em uma posição anterior
                    this.tela.elementos.splice(indice-1,0,elemento);
                    
                    this.atualizarOrdemElementos(this.tela);

                    this.atualizouElementoTreemap(elemento);
                    
                    this.criarTreeMap();   
                }
            }); 
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_IR_PARA_FRENTE, (evento) => {
                let idElementoProcurado = evento.detail;
                let indice = this.tela.elementos.map(e => e.id).indexOf (idElementoProcurado);
                
                if (indice < (this.tela.elementos.length-1)){
                    
                    //Remove o elemento da posição
                    let [elemento] = this.tela.elementos.splice(indice,1);                    
                    //O recoloca em uma posição posterior
                    this.tela.elementos.splice(indice+1,0,elemento);
                    
                    this.atualizarOrdemElementos(this.tela);

                    this.atualizouElementoTreemap(elemento);

                    this.criarTreeMap();   
                }
            });     
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_IR_PARA_INICIO, (evento) => {
                let idElementoProcurado = evento.detail;
                let indice = this.tela.elementos.map(e => e.id).indexOf (idElementoProcurado);

                if (indice > 0){

                    //Remove o elemento da posição
                    let [elemento] = this.tela.elementos.splice(indice,1);
                    //O recoloca no inicio
                    this.tela.elementos.splice(0,0,elemento);
                    
                    this.atualizarOrdemElementos(this.tela);

                    this.atualizouElementoTreemap(elemento);

                    this.criarTreeMap();   
                }
            });   
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_IR_PARA_FIM, (evento) => {
                let idElementoProcurado = evento.detail;
                let indice = this.tela.elementos.map(e => e.id).indexOf (idElementoProcurado);

                if (indice < (this.tela.elementos.length-1)){

                    //Remove o elemento da posição
                    let [elemento] = this.tela.elementos.splice(indice,1);
                    //O recoloca no final
                    this.tela.elementos.splice(this.tela.elementos.length,0,elemento);
                    
                    this.atualizarOrdemElementos(this.tela);

                    this.atualizouElementoTreemap(elemento);

                    this.criarTreeMap();   
                }
            });  
              
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_MUDAR_VISUALIZACAO, (evento) => {
                this.atualizarTreeMap();
            });
        });
    }

    atualizouElementoTreemap(elemento){
         //Cria um novo evento indicando dados do componente
         let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_OBJETO, {                    
            componente: elemento.componente,
            dados:{
                valorAntigo: elemento.dados, 
                novoValor: elemento.dados
            },
            id: elemento.id,
            descricao: elemento.descricao,
            importancia: elemento.importancia,
            ordem: elemento.ordem
    });
    
    this.dispatchEvent(eventoCompleto);   
    }


    atualizarTreeMap(){

        const margin = {top: 0, right: 0, bottom: 0, left: 0};
        const width = this.container.clientWidth - margin.left - margin.right;
        const height = this.container.clientHeight - margin.top - margin.bottom;
        const color = d3.scaleOrdinal().range(d3.schemeCategory20c);            
    
        this.treemap = d3.treemap().size([width, height]);                            

        const root = this.criarRaizHierarquicaD3JS(this.tela); 

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

    set tela(novaTela){
        this._tela = novaTela;
        this.renderizar();
    }

    get tela(){
        return this._tela;
    }

    static get observedAttributes() {
        return ['tela'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

        //Atributo componente é usado pelo ElementoTreeMap para definir qual componente renderizar
        if (nomeAtributo.localeCompare("tela") == 0){

            this._tela = JSON.parse(novoValor);
            this.renderizar();
        }
    }
}

customElements.define('container-treemap', ContainerTreeMap);