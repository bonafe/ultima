import { BaseTestesTreeMap } from './base_teste.js';
import { ComponenteBase } from '../componente_base.js';
import { ElementoTreeMap } from './elemento_treemap.js';

export class ContainerTreeMap extends ComponenteBase{

    constructor(){
        super({templateURL:"/componentes/container_treemap/container_treemap.html", shadowDOM:false});        

        this.addEventListener("carregou", () => {

            this.container = this.noRaiz.querySelector("#containerTreeMap");
            this.renderizar(BaseTestesTreeMap.base);
        });        
    }

    processarNovasDimensoes(largura, altura){
        
        this.renderizar(BaseTestesTreeMap.base);
    }


    renderizar(dados) {

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
        
        const root = d3.hierarchy(dados, (d) => (d.telas ? d.telas : d.componentes)).sum((d) => d.importancia);
      
        this.tree = this.treemap(root);
      
        this.node = div.datum(root).selectAll(".node")
            .data(this.tree.leaves())
                .enter().append("elemento-treemap")
                    .attr("class", "node container")
                    .attr("componente",(d) => JSON.stringify(d.data.componente))
                    .attr("dados",(d) => JSON.stringify(d.data.dados))
                    .style("left", (d) => d.x0 + "px")
                    .style("top", (d) => d.y0 + "px")
                    .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
                    .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
                    .style("background", (d) => color(d.parent.data.nome))
                    .text((d) => d.data.nome);        
    }
}

customElements.define('container-treemap', ContainerTreeMap);