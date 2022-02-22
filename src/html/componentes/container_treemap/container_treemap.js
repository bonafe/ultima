import { ComponenteBase } from '../componente_base.js';
import { ElementoTreeMap } from './elemento_treemap.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';


export class ContainerTreeMap extends ComponenteBase{


    constructor(){
        super({templateURL:"/componentes/container_treemap/container_treemap.html", shadowDOM:false});        

        this._tela = undefined;

        this.addEventListener("carregou", () => {

            this.container = this.noRaiz.querySelector(".container_treemap");
            this.renderizar();
        });        
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
                
        return d3.hierarchy(tela, (d) => d.elementos)
            .sum( d => {
                return d.importancia;
            })
            .sort((a, b) => {             
                return a.data.ordem - b.data.ordem;
            });              
    }


    adicionarElemento(elemento){                                          

        this._tela.elementos.push(JSON.parse(JSON.stringify(elemento)));
        
        const root = this.criarRaizHierarquicaD3JS(this._tela);
       
        //TODO: não funciona!!!!
        //this.atualizarTreeMap();
        //this.d3Enter(root);

        //TODO: não pode criar, tem que atualizar, código abaixo não estã funcionando
        this.criarTreeMap();
        
    }


    criarTreeMap(){

        const margin = {top: 0, right: 0, bottom: 0, left: 0};
        const width = this.container.clientWidth - margin.left - margin.right;
        const height = this.container.clientHeight - margin.top - margin.bottom;
        const color = d3.scaleOrdinal().range(d3.schemeCategory20c);
    
        d3.select(this.container).selectAll("div").remove();
    
        this.treemap = d3.treemap().size([width, height]);

        this.divD3 = d3.select(this.container).append("div")
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right) + "px")
            .style("height", (height + margin.top + margin.bottom) + "px")
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");
        
        const root = this.criarRaizHierarquicaD3JS(this._tela);        
            
        this.d3Enter(root);                      
                    
        this.adicionarListenersElementoTreepmap();
    }



    d3Enter(root){
        this.node = this.divD3.datum(root).selectAll(".node")
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



    set tela(novaTela){
        this._tela = JSON.parse(JSON.stringify(novaTela));
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



    adicionarListenersElementoTreepmap(){
        //TODO: levar listeners para dentro do adicionar elementos
        this.noRaiz.querySelectorAll("elemento-treemap").forEach((elementoTreemap, indice) =>
        {                        
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_AUMENTAR, (evento) => {
                let idElementoProcurado = evento.detail.id;
                let elemento = this.tela.elementos.find (elemento => elemento.id == idElementoProcurado);

                if (evento.detail.mousemove){
                    elemento.importancia *= 1.01;
                }else{
                    //TODO: Tamanho máximo???
                    elemento.importancia *= 1.5;
                }

                this.atualizouTreemap();

                this.atualizarTreeMap();                  
            });
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_DIMINUIR, (evento) => {
                let idElementoProcurado = evento.detail;
                let elemento = this.tela.elementos.find (elemento => elemento.id == idElementoProcurado);
                //TODO: Tamanho mínimo???
                elemento.importancia *= 0.50;

                this.atualizouTreemap();

                this.atualizarTreeMap();   
            }); 
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_MAXIMIZAR, (evento) => {
                let idElementoProcurado = evento.detail;
                let elemento = this.tela.elementos.find (elemento => elemento.id == idElementoProcurado);

                let somaImportanciaOutros = this.tela.elementos.reduce ((valorAnterior, elementoAtual) => {
                    if (elementoAtual.id != elemento.id){                        
                        return valorAnterior + elementoAtual.importancia;
                    }else{
                        return valorAnterior;
                    }
                },0);
                console.log (`Soma importancia outros: ${somaImportanciaOutros}`);
                elemento.importancia = somaImportanciaOutros;

                this.atualizouTreemap();

                this.atualizarTreeMap();   
            }); 
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_MINIMIZAR, (evento) => {
                let idElementoProcurado = evento.detail;
                let elemento = this.tela.elementos.find (elemento => elemento.id == idElementoProcurado);

                let menorImportancia = this.tela.elementos.reduce ((valorAnterior, elementoAtual) => {
                    if (elementoAtual.importancia < valorAnterior){
                        return elementoAtual.importancia;
                    }else{
                        return valorAnterior;
                    }
                },Number.MAX_VALUE);
                
                elemento.importancia = menorImportancia;

                this.atualizouTreemap();

                this.atualizarTreeMap();   
            });
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_RESTAURAR, (evento) => {
                let idElementoProcurado = evento.detail;
                let elemento = this.tela.elementos.find (elemento => elemento.id == idElementoProcurado);

                let somaImportancia = this.tela.elementos.reduce ((valorAnterior, elementoAtual) => {                    
                    return valorAnterior + elementoAtual.importancia;                    
                },0);
                
                const mediaImportancia = somaImportancia / this.tela.elementos.length || 0;

                elemento.importancia = mediaImportancia;

                this.atualizouTreemap();

                this.atualizarTreeMap();   
            });
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_FECHAR, (evento) => {
                let idElementoProcurado = evento.detail;
                let indice = this.tela.elementos.map(e => e.id).indexOf (idElementoProcurado);

                if (indice >= 0){

                    //Remove o elemento da posição
                    let [elemento] = this.tela.elementos.splice(indice,1);
                    
                    this.atualizarOrdemElementos(this.tela);

                    this.atualizouTreemap();
                    
                    //this.atualizarTreeMap();
                    this.criarTreeMap();      
                }
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

                    this.atualizouTreemap();
                    
                    //this.atualizarTreeMap();
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

                    this.atualizouTreemap();

                    //this.atualizarTreeMap();
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
                    
                    console.log ("ANTES")
                    this.tela.elementos.forEach (e => console.log (`${e.id}-${e.ordem}`));

                    this.atualizarOrdemElementos(this.tela);        

                    console.log ("DEPOIS")
                    this.tela.elementos.forEach (e => console.log (`${e.id}-${e.ordem}`));                    

                    this.atualizouTreemap();

                    //this.atualizarTreeMap();
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

                    this.atualizouTreemap();

                    //this.atualizarTreeMap();
                    this.criarTreeMap();   
                }
            });  
              
            elementoTreemap.addEventListener(ElementoTreeMap.EVENTO_MUDAR_VISUALIZACAO, (evento) => {
                this.atualizarTreeMap();
            });

            elementoTreemap.addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_DADOS, evento => {

                //Para a propagaçaõ do evento do componente
                evento.stopPropagation();

                let elemento = this.tela.elementos.find(e => e.id == evento.detail.id);

                //Mantêm esta referência dos dados atualizada com a mudança
                elemento.dados = evento.detail.dados;

                //Cria um novo evento acrescentando o restante do elemento
                let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_DADOS, 
                    JSON.parse(JSON.stringify(elemento))
                );
                
                this.dispatchEvent(eventoCompleto);                
            });
            elementoTreemap.addEventListener(UltimaEvento.EVENTO_SELECAO_OBJETO, evento => {                        

                //Para a propagaçaõ do evento do componente
                evento.stopPropagation();

                //Cria uma copia por valor para enviar de forma segura no evento
                let elemento =  JSON.parse(JSON.stringify(this.tela.elementos.find(e => e.id == evento.detail.id_origem)));

                //Cria um novo evento indicando dados do componente
                let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_SELECAO_OBJETO,{
                    elemento_origem: elemento,
                    dados: evento.detail.dados
                });
                
                this.dispatchEvent(eventoCompleto);                                                                  
            });
        });
    }



    atualizouTreemap(){
        //Cria um novo evento indicando dados do componente
        let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_TREEMAP, {                    
           tela: JSON.parse(JSON.stringify(this.tela))
       });
   
       this.dispatchEvent(eventoCompleto);   
    }



    processarNovasDimensoes(largura, altura){
        
        this.renderizar();
    }
}

customElements.define('container-treemap', ContainerTreeMap);