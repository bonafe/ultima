import { UltimaView } from '../ultima_view.js';

import { UltimaTreemapElemento } from './ultima_treemap_elemento.js';
import { UltimaEvento } from '../../ultima_evento.js';
import { ComponenteBase } from '../../../componente_base.js';


export class UltimaTreemapView extends UltimaView{


    constructor(){
        super();        

        this.cssCarregado = false;

        this.addEventListener("carregou", () => {            

            this.container = this.noRaiz.querySelector(".componente_navegacao_view");

            this.carregarCSS("./ultima_treemap_view.css", import.meta.url)
                .then(()=>{
                    this.cssCarregado = true;
                    this.renderizar();
                });            
        });        
    }



    renderizar() {

        if (this.container && this._view && this.cssCarregado){

            //Atualiza o atributo ordem do elemento
            this._view.elementos.forEach ((elemento, indice) => elemento.ordem = indice);

            if (!this.node){
                this.criarTreeMap();
            }else{
                this.atualizarTreeMap();
            }
        }
        super.renderizar();
    }
    


    adicionarElemento(elemento){                                          

        this._view.elementos.push(JSON.parse(JSON.stringify(elemento)));
                               
        this.renderizar();    
    }



    atualizarElemento(uuid_elemento){
        let seletor = `ultima-treemap-elemento[uuid_elemento="${uuid_elemento}"]`;
        let elementos = this.noRaiz.querySelectorAll(seletor);
        console.log (`ATUALIZANDO ELEMENTOS VIEW COM O ELEMENTO PROCURADP: quantidade ${elementos.length}`);
        elementos.forEach(ultimaTreemapElemento => ultimaTreemapElemento.atualizar());        
    }



    criarTreeMap(){

        d3.select(this.container).selectAll("div").remove();
    
        this.divD3 = d3.select(this.container).append("div")
            .style("position", "relative")
            .style("width", (this.widthTreemap + this.marginTreemap.left + this.marginTreemap.right) + "px")
            .style("height", (this.heightTreemap + this.marginTreemap.top + this.marginTreemap.bottom) + "px")
            .style("left", this.marginTreemap.left + "px")
            .style("top", this.marginTreemap.top + "px");
        
        this.enterUpdateExit();  
    }



    enterUpdateExit(){

        this.treemap = d3.treemap().size([this.widthTreemap, this.heightTreemap]);
        
        //TODO: tive que criar o campo id pois não sei setar um campo com nome diferente no D3 e estava
        //Redesenhando a tela toda hora pois mudou de campo id para uuid o nome
        this.view.elementos.forEach (e => e.id = e.uuid);

        const root = d3.hierarchy(this.view, (d) => d.elementos)
            
            //Valor do elemento para cálculo da área do TreeMap
            .sum( d => d.importancia)

            //Ordem dos elementos no Treemap
            .sort((a, b) => (a.data.ordem - b.data.ordem));         
        
        //console.log (root.children.map(e => `[id:${e.data.id} descricao:${e.data.descricao} ordem:${e.data.ordem} importancia:${e.data.importancia}]`).join("\n"));

        this.node = this.divD3.selectAll(".node_treemap_d3js").data(this.treemap(root).leaves(), d => d.data.id);                                      

        //EXIT
        this.node.exit().remove();

        let novosNos = this.node
            //ENTER
            .enter()
                .append("ultima-treemap-elemento")                    
                    .attr("class", "node_treemap_d3js container_treemap_d3js")
                    .attr("uuid_elemento_view",(d) => d.data.uuid)
                    .attr("uuid_view", (d) => this._view.uuid)                    
                    .attr("uuid_elemento", (d) => d.data.uuid_elemento)
                    .style("left", (d) => d.x0 + "px")
                    .style("top", (d) => d.y0 + "px")
                    .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
                    .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px");
   
        this.node
            //UPDATE
            .transition().duration(500)
                .style("left", d => {
                    //console.log (`******* ATUALIZANDO elemento-treemap: ${d.data.id} (ordem: ${d.data.ordem})`);
                    return `${d.x0}px`;
                })
                .style("top", d => `${d.y0}px`)
                .style('width', d => `${Math.max(0, d.x1 - d.x0 -1)}px`)
                .style('height', d => `${Math.max(0, d.y1 - d.y0 -1)}px`);                                    
    }



    atualizarTreeMap(){

        this.enterUpdateExit();
    }


    encontrarEAplicarMudanca(idElementoProcurado, funcaoDeMudanca){
                
        let indice = this.view.elementos.map(e => e.uuid).indexOf (idElementoProcurado);

        let elemento = this.view.elementos[indice];

        //Aqui é um caso interessante pois é usado o operador !== false porque o normal é não ser false        
        //Se der algum erro na funcaoDeMudanca ela vai explicitamente retornar false
        //Normalmente undefined é avaliado como falso em uma comparação normal,
        //nesse caso undefined precisa ser tratado como um retorno verdadeiro
        if (funcaoDeMudanca(elemento, indice) !== false){
        
            this.renderizar();                  
            this.dispatchEvent(new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_VIEW,{uuid_view:this.view.uuid})); 
        }
    }



    aumentar(propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_view, elemento => {
            elemento.importancia *= 1.5;   
        });
    }




    diminuir (propriedades) {        
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_view, elemento => {
            elemento.importancia *= 0.50;  
        });
    }



    maximizar (propriedades) {

        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_view, elemento => {

            let somaImportanciaOutros = this.view.elementos.reduce ((valorAnterior, elementoAtual) => {
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
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_view, elemento => {

            let menorImportancia = this.view.elementos.reduce ((valorAnterior, elementoAtual) => {
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
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_view, elemento => {

            let somaImportancia = this.view.elementos.reduce ((valorAnterior, elementoAtual) => {                    
                return valorAnterior + elementoAtual.importancia;                    
            },0);
            
            const mediaImportancia = somaImportancia / this.view.elementos.length || 0;

            elemento.importancia = mediaImportancia;
        });
    }



    fechar (propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_view, (elemento, indice) => {

            if (indice >= 0){

                //Remove o elemento da posição
                let [elemento] = this.view.elementos.splice(indice,1);                                                        

            }else{

                //Não executa atualização
                return false;
            }
        });
    }



    irParaTras(propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_view, (elemento, indice) => {

            if (indice > 0){

                //Remove o elemento da posição
                let [elemento] = this.view.elementos.splice(indice,1);
                //O recoloca em uma posição anterior
                this.view.elementos.splice(indice-1,0,elemento);                                        
                
            }else{

                //Não executa atualização
                return false;
            }
        });
    }



    irParaFrente(propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_view, (elemento, indice) => {
        
            if (indice < (this.view.elementos.length-1)){
                
                //Remove o elemento da posição
                let [elemento] = this.view.elementos.splice(indice,1);                    
                //O recoloca em uma posição posterior
                this.view.elementos.splice(indice+1,0,elemento);                                        
                         
            }else{

                //Não executa atualização
                return false;
            }
        });
    }



    irParaFim(propriedades) {
        
        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_view, (elemento, indice) => {
        
            if (indice < (this.view.elementos.length-1)){

                //Remove o elemento da posição
                let [elemento] = this.view.elementos.splice(indice,1);
                //O recoloca no final
                this.view.elementos.splice(this.view.elementos.length,0,elemento);
                                                    
            }else{

                //Não executa atualização
                return false;
            }
        });
    }



    irParaInicio(propriedades) {

        this.encontrarEAplicarMudanca(propriedades.uuid_elemento_view, (elemento, indice) => {
        
        if (indice > 0){

            //Remove o elemento da posição
            let [elemento] = this.view.elementos.splice(indice,1);
            //O recoloca no inicio
            this.view.elementos.splice(0,0,elemento);                       

           }else{

                //Não executa atualização
                return false;
            }
        });
    }
}

customElements.define('ultima-treemap-view', UltimaTreemapView);