import { ComponenteBase } from '../componente_base.js';
import { ElementoTreeMap } from './elemento_treemap.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';
import { UltimaDAO } from '../ultima/ultima_dao.js';


export class ContainerTreeMap extends ComponenteBase{


    constructor(){
        super({templateURL:"/componentes/container_treemap/container_treemap.html", shadowDOM:false});        

        this._view = undefined;

        this.addEventListener("carregou", () => {

            this.container = this.noRaiz.querySelector(".container_treemap");

            this.atualizarDimensoes();            

            this.renderizar();
        });        
    }

    atualizarDimensoes(){
        this.marginTreemap = {top: 0, right: 0, bottom: 0, left: 0};
        this.widthTreemap = this.container.clientWidth - this.marginTreemap.left - this.marginTreemap.right;
        this.heightTreemap = this.container.clientHeight - this.marginTreemap.top - this.marginTreemap.bottom;
        this.colorTreemap = d3.scaleOrdinal().range(d3.schemeCategory20c);
    }


    renderizar() {

        if (this.container && this._view){

            //Atualiza o atributo ordem do elemento
            this._view.elementos.forEach ((elemento, indice) => elemento.ordem = indice);

            if (!this.node){
                this.criarTreeMap();
            }else{
                this.atualizarTreeMap();
            }
        }
    }
    


    adicionarElemento(elemento){                                          

        this._view.elementos.push(JSON.parse(JSON.stringify(elemento)));
                               
        this.renderizar();    
    }

    atualizarElemento(elemento){
        
    }


    criarTreeMap(){

       //console.log ("!!!!!!!!!!!!!!!!! CRIAR TREEMAP !!!!!!!!!!!!!!!!!!!!!!!");

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
        
        const root = d3.hierarchy(this.view, (d) => d.elementos)
            //Valor do elemento para cálculo da área do TreeMap
            .sum( d => {
                return d.importancia;
            })
            //Ordem dos elementos no Treemap
            .sort((a, b) => {             
                return a.data.ordem - b.data.ordem;
            });         
        
        //console.log (root.children.map(e => `[id:${e.data.id} descricao:${e.data.descricao} ordem:${e.data.ordem} importancia:${e.data.importancia}]`).join("\n"));

        this.node = this.divD3.selectAll(".node").data(this.treemap(root).leaves(), d => d.data.id);                                      

        //EXIT
        this.node.exit().remove();

        let novosNos = this.node
            //ENTER
            .enter()
                .append("elemento-treemap")                    
                    .attr("class", "node container")
                    .attr("id",(d) => JSON.stringify(d.data.id))
                    .attr("id_view", (d) => JSON.stringify(this._view.id))                    
                    .style("left", (d) => d.x0 + "px")
                    .style("top", (d) => d.y0 + "px")
                    .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
                    .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px");
        
        this.adicionarListenersElementoTreepmap(novosNos);
                
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

        //console.log ("**************************** ATUALIZAR TREEMAP");

        this.enterUpdateExit();
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



    adicionarListenersElementoTreepmap(novosNos){                               
        [
            {evento:ElementoTreeMap.EVENTO_AUMENTAR, funcao:this.aumentar},
            {evento:ElementoTreeMap.EVENTO_DIMINUIR, funcao:this.diminuir},
            {evento:ElementoTreeMap.EVENTO_MAXIMIZAR, funcao:this.maximizar},
            {evento:ElementoTreeMap.EVENTO_MINIMIZAR, funcao:this.minimizar},
            {evento:ElementoTreeMap.EVENTO_RESTAURAR, funcao:this.restaurar},
            {evento:ElementoTreeMap.EVENTO_FECHAR, funcao:this.fechar},
            {evento:ElementoTreeMap.EVENTO_IR_PARA_TRAS, funcao:this.irParaTras},
            {evento:ElementoTreeMap.EVENTO_IR_PARA_FRENTE, funcao:this.irParaFrente},
            {evento:ElementoTreeMap.EVENTO_IR_PARA_INICIO, funcao:this.irParaInicio},
            {evento:ElementoTreeMap.EVENTO_IR_PARA_FIM, funcao:this.irParaFim},            
            {evento:ElementoTreeMap.EVENTO_MUDAR_VISUALIZACAO, funcao:this.mudarVisualizacao},
            {evento:UltimaEvento.EVENTO_ATUALIZACAO_VIEW, funcao:this.atualizacaoElementoView},            
            {evento:UltimaEvento.EVENTO_SELECAO_OBJETO, funcao:this.selecaoObjeto},
        ].forEach (e => {
            novosNos.on (e.evento, e.funcao.bind(this));                
        });                                
    }



    atualizouTreemap(){
        //Cria um novo evento indicando dados do componente
        let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_TREEMAP, {                    
           view: JSON.parse(JSON.stringify(this.view))
       });
   
       this.dispatchEvent(eventoCompleto);   
    }



    processarNovasDimensoes(largura, altura){

        //console.info (`--------------------------------> ATUALIZOU DIMENSÕES DO CONTAINER TREEMAP`);

        this.atualizarDimensoes();
        this.renderizar();
    }



    aumentar(elementoTreemap) {
        
        let evento = d3.event;

        //console.info (`--------------------------------> EVENTO_AUMENTAR elemento Treemap: ${evento.detail}`);

        let idElementoProcurado = evento.detail;
        let elemento = this.view.elementos.find (elemento => elemento.id == idElementoProcurado);

        if (evento.detail.mousemove){
            elemento.importancia *= 1.01;
        }else{
            //TODO: Tamanho máximo???
            elemento.importancia *= 1.5;
        }
        
        this.renderizar();                  
        this.atualizouTreemap();
    }



    diminuir (elementoTreemap) {
        
        let evento = d3.event;
        
        //console.info (`--------------------------------> EVENTO_DIMINUIR elemento Treemap: ${evento.detail}`);

        let idElementoProcurado = evento.detail;
        let elemento = this.view.elementos.find (elemento => elemento.id == idElementoProcurado);
        //TODO: Tamanho mínimo???
        elemento.importancia *= 0.50;
        
        this.renderizar();   
        this.atualizouTreemap();
    }



    maximizar (elementoTreemap) {
        
        let evento = d3.event;

        //console.info (`--------------------------------> EVENTO_MAXIMIZAR elemento Treemap: ${evento.detail}`);

        let idElementoProcurado = evento.detail;
        let elemento = this.view.elementos.find (elemento => elemento.id == idElementoProcurado);

        let somaImportanciaOutros = this.view.elementos.reduce ((valorAnterior, elementoAtual) => {
            if (elementoAtual.id != elemento.id){                        
                return valorAnterior + elementoAtual.importancia;
            }else{
                return valorAnterior;
            }
        },0);
        //console.log (`Soma importancia outros: ${somaImportanciaOutros}`);
        elemento.importancia = somaImportanciaOutros;

        this.renderizar();
        this.atualizouTreemap();          
    }



    minimizar (elementoTreemap) {
        
        let evento = d3.event;

        //console.info (`--------------------------------> EVENTO_MINIMIZAR elemento Treemap: ${evento.detail}`);

        let idElementoProcurado = evento.detail;
        let elemento = this.view.elementos.find (elemento => elemento.id == idElementoProcurado);

        let menorImportancia = this.view.elementos.reduce ((valorAnterior, elementoAtual) => {
            if (elementoAtual.importancia < valorAnterior){
                return elementoAtual.importancia;
            }else{
                return valorAnterior;
            }
        },Number.MAX_VALUE);
        
        elemento.importancia = menorImportancia;

        this.renderizar();
        this.atualizouTreemap();         
    }



    restaurar (elementoTreemap) {
        
        let evento = d3.event;

        //console.info (`--------------------------------> EVENTO_RESTAURAR elemento Treemap: ${evento.detail}`);                

        let idElementoProcurado = evento.detail;
        let elemento = this.view.elementos.find (elemento => elemento.id == idElementoProcurado);

        let somaImportancia = this.view.elementos.reduce ((valorAnterior, elementoAtual) => {                    
            return valorAnterior + elementoAtual.importancia;                    
        },0);
        
        const mediaImportancia = somaImportancia / this.view.elementos.length || 0;

        elemento.importancia = mediaImportancia;

        this.renderizar();   
        this.atualizouTreemap();        
    }



    fechar (elementoTreemap) {
        
        let evento = d3.event;

        //console.info (`--------------------------------> EVENTO_FECHAR elemento Treemap: ${evento.detail}`);                

        let idElementoProcurado = evento.detail;
        let indice = this.view.elementos.map(e => e.id).indexOf (idElementoProcurado);

        if (indice >= 0){

            //Remove o elemento da posição
            let [elemento] = this.view.elementos.splice(indice,1);                                        

            this.renderizar();
            this.atualizouTreemap();                                                     
        }
    }



    irParaTras(elementoTreemap) {
        
        let evento = d3.event;

        //console.info (`--------------------------------> EVENTO_IR_PARA_TRAS elemento Treemap: ${evento.detail}`);                

        let idElementoProcurado = evento.detail;
        let indice = this.view.elementos.map(e => e.id).indexOf (idElementoProcurado);

        if (indice > 0){

            //Remove o elemento da posição
            let [elemento] = this.view.elementos.splice(indice,1);
            //O recoloca em uma posição anterior
            this.view.elementos.splice(indice-1,0,elemento);                                        

            this.renderizar();                    
            this.atualizouTreemap();            
        }
    }



    irParaFrente(elementoTreemap) {
        
        let evento = d3.event;

        //console.info (`--------------------------------> EVENTO_IR_PARA_FRENTE elemento Treemap: ${evento.detail}`);                

        let idElementoProcurado = evento.detail;
        let indice = this.view.elementos.map(e => e.id).indexOf (idElementoProcurado);
        
        if (indice < (this.view.elementos.length-1)){
            
            //Remove o elemento da posição
            let [elemento] = this.view.elementos.splice(indice,1);                    
            //O recoloca em uma posição posterior
            this.view.elementos.splice(indice+1,0,elemento);                                        

            this.renderizar();   
            this.atualizouTreemap();                             
        }
    }



    irParaFim(elementoTreemap) {
        
        let evento = d3.event;

        //console.info (`--------------------------------> EVENTO_IR_PARA_FIM elemento Treemap: ${evento.detail}`);                
        ;
        let idElementoProcurado = evento.detail;
        let indice = this.view.elementos.map(e => e.id).indexOf (idElementoProcurado);

        if (indice < (this.view.elementos.length-1)){

            //Remove o elemento da posição
            let [elemento] = this.view.elementos.splice(indice,1);
            //O recoloca no final
            this.view.elementos.splice(this.view.elementos.length,0,elemento);
                        
            this.renderizar(); 
            this.atualizouTreemap();            
        }
    }



    irParaInicio(elementoTreemap) {
        
        let evento = d3.event;

        //console.info (`--------------------------------> EVENTO_IR_PARA_INICIO elemento Treemap: ${evento.detail}`);                

        let idElementoProcurado = evento.detail;
        let indice = this.view.elementos.map(e => e.id).indexOf (idElementoProcurado);

        if (indice > 0){

            //Remove o elemento da posição
            let [elemento] = this.view.elementos.splice(indice,1);
            //O recoloca no inicio
            this.view.elementos.splice(0,0,elemento);                       

            this.renderizar(); 
            this.atualizouTreemap();                
        }
    }



    atualizacaoElementoView(elementoTreemap) {
        
        let evento = d3.event;

        //Para a propagaçaõ do evento do componente
        evento.stopPropagation();

        let elemento_view_atualizado = evento.detail;

        let indice = this.view.elementos.map(e => e.id).indexOf (elemento_view_atualizado.id);

        //Remove o elemento da posição
        let [elemento] = this.view.elementos.splice(indice,1);

        //Coloca o elemento atualizado no lugar
        this.view.elementos.splice(indice,0,elemento_view_atualizado);  

        UltimaDAO.getInstance().atualizarView(this.view).then(()=>{
            //Cria um novo evento acrescentando o restante do elemento
            this.dispararEventoAtualizouView();
        })                                       
    }

    dispararEventoAtualizouView(){
        this.dispatchEvent(new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_VIEW,{id:this.view.id})); 
    }



    selecaoObjeto(elementoTreemap) {
        
        let evento = d3.event;

        //Para a propagaçaõ do evento do componente
        evento.stopPropagation();

        //Cria uma copia por valor para enviar de forma segura no evento
        let elemento =  JSON.parse(JSON.stringify(this.view.elementos.find(e => e.id == evento.detail.id_origem)));

        //Cria um novo evento indicando dados do componente
        let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_SELECAO_OBJETO,{
            elemento_origem: elemento,
            dados: evento.detail.dados
        });
        
        this.dispatchEvent(eventoCompleto);                                                                  
    }

    mudarVisualizacao(elementoTreemap) {
        
        let evento = d3.event;

    }
}

customElements.define('container-treemap', ContainerTreeMap);