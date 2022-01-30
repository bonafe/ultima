import { ComponenteBase } from '../componente_base.js';
import { ElementoTreeMap } from './elemento_treemap.js';



export class ContainerTreeMap extends ComponenteBase{



    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO';



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
            
            const root = d3.hierarchy(this._elementos, (d) => (d.telas ? d.telas : d.elementos)).sum((d) => d.importancia);
        
            this.tree = this.treemap(root);
        
            this.node = div.datum(root).selectAll(".node")
                .data(this.tree.leaves())
                    .enter().append("elemento-treemap")
                        .attr("class", "node container")
                        .attr("id",(d) => JSON.stringify(d.data.id))
                        .attr("componente",(d) => JSON.stringify(d.data.componente))
                        .attr("dados",(d) => JSON.stringify(d.data.dados))                        
                        .style("left", (d) => d.x0 + "px")
                        .style("top", (d) => d.y0 + "px")
                        .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
                        .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px");
                        //.style("background", (d) => color(d.parent.data.nome))
                        //.text((d) => d.data.nome); 
                        
            this.noRaiz.querySelectorAll("elemento-treemap").forEach((elementoTreemap, indice) =>
            {
                elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_SELECAO_OBJETO, (evento) => {
                    this.dispatchEvent(
                        new CustomEvent(
                            ContainerTreeMap.EVENTO_SELECAO_OBJETO,
                            {
                                detail:{
                                    indice: indice,
                                    objeto: evento.detail
                                }
                            }));                
                });
                elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_AUMENTAR, (evento) => {
                    let idElementoProcurado = evento.detail;
                    let elemento = this.elementos["telas"][0]["elementos"].find (elemento => elemento.id == idElementoProcurado);
                    elemento.importancia *= 1.5;
                    this.renderizar();                  
                });
                elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_DIMINUIR, (evento) => {
                    let idElementoProcurado = evento.detail;
                    let elemento = this.elementos["telas"][0]["elementos"].find (elemento => elemento.id == idElementoProcurado);
                    elemento.importancia *= 0.50;
                    this.renderizar();   
                });     
                elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_IR_PARA_TRAS, (evento) => {
                    let idElementoProcurado = evento.detail;
                    let indice = this.elementos["telas"][0]["elementos"].map(e => e.id).indexOf (idElementoProcurado);

                    if (indice > 0){

                        //Remove o elemento da posição
                        let [elemento] = this.elementos["telas"][0]["elementos"].splice(indice,1);

                        //O recoloca em uma posição anterior
                        this.elementos["telas"][0]["elementos"].splice(indice-1,0,elemento);
                            
                        this.renderizar();   
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
                            
                        this.renderizar();   
                    }
                });     
                          
            });
        }
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