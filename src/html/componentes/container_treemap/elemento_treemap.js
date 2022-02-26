import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';
import { UltimaDAO } from "../ultima/ultima_dao.js";


export class ElementoTreeMap extends ComponenteBase {



    static EVENTO_AUMENTAR = 'EVENTO_AUMENTAR';
    static EVENTO_DIMINUIR = 'EVENTO_DIMINUIR';
    static EVENTO_IR_PARA_TRAS = 'EVENTO_IR_PARA_TRAS';
    static EVENTO_IR_PARA_FRENTE = 'EVENTO_IR_PARA_FRENTE';    
    static EVENTO_IR_PARA_INICIO = 'EVENTO_IR_PARA_INICIO';
    static EVENTO_IR_PARA_FIM = 'EVENTO_IR_PARA_FIM'; 
    static EVENTO_MAXIMIZAR = 'EVENTO_MAXIMIZAR'; 
    static EVENTO_MINIMIZAR = 'EVENTO_MINIMIZAR';
    static EVENTO_RESTAURAR = 'EVENTO_RESTAURAR';
    static EVENTO_MUDAR_VISUALIZACAO = 'EVENTO_MUDAR_VISUALIZACAO';
    static EVENTO_FECHAR = 'EVENTO_FECHAR';
    



    constructor(){
        super({templateURL:"/componentes/container_treemap/elemento_treemap.html", shadowDOM:true});

        this.dados = null;

        this.addEventListener("carregou", () => {  

            this.containerComponente = this.noRaiz.querySelector("#containerComponente");
            this.containerConfiguracao = this.noRaiz.querySelector("#containerConfiguracao");
            
            //Estilos da configuração
            this.noRaiz.querySelector("#voltar").style.display = "none";
            this.containerComponente.style.display = "flex";
            this.containerConfiguracao.style.display = "none";

            //Comportamento navegação
            this.adicionarComportamentoBotoesElementoTreemap();


            if (this.componente && !this.carregandoComponente){

                this.carregarComponente();

            }else{

                this.renderizar(); 
            }                    
        });
    }



    configuracao(abrir){

        if (abrir){
            this.containerComponente.style.display = "none";
            this.containerConfiguracao.style.display = "flex";

            this.noRaiz.querySelector("#voltar").style.display = "block";
            this.noRaiz.querySelector("#configuracao").style.display = "none";

            if (this.carregouComponentesConfiguracao){

                this.renderizar();

            }else{

                let url_editor_json = super.prefixoEndereco + "/componentes/editor_json/editor_json.js";                

                import(url_editor_json).then(modulo => {
                    
                    this.editorDados = this.noRaiz.querySelector("#editorDados");

                    this.editorDados.addEventListener("change", evento => {
                        evento.stopPropagation();

                        this.elemento.dados = evento.detail;

                        UltimaDAO.getInstance().atualizarElemento(this.elemento).then(()=>{

                            //Cria um novo evento indicando dados do componente
                            let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_ELEMENTO, {                        
                                id:this._id,
                                id_view:this._id_view
                            });                    
                            this.dispatchEvent(eventoCompleto);      
                        });
                    });

                    this.montarSelectComponente();
                    this.carregouComponentesConfiguracao = true;
                    this.renderizar();                   
                });                
            }            

        //FECHAR / ENCERRAR
        }else{

            this.containerComponente.style.display = "flex";
            this.containerConfiguracao.style.display = "none";

            this.noRaiz.querySelector("#voltar").style.display = "none";
            this.noRaiz.querySelector("#configuracao").style.display = "block";                        
        }
    }

    montarSelectComponente(){
        UltimaDAO.getInstance().componentes().then(componentes => {
            
            this.componentes = componentes;

            let select = this.noRaiz.querySelector("#selectComponente");
            select.innerHTML = "";

            this.componentes.forEach(componente => {
                let o = document.createElement("option");
                select.appendChild(o);
                
                o.textContent = componente.nome;
                o.value = componente.nome;

                //Seleciona se for igual ao componente atual
                if (this.componente.nome == componente.nome){
                    select.value = componente.nome;
                }
            });


            try{
                select.removeEventListenter("change", eventoSelecionouComponente.bind(this));
            }catch(e){};

            select.addEventListener("change", eventoSelecionouComponente.bind(this));

            function eventoSelecionouComponente(evento){           
                evento.stopPropagation();
                this.componente = this.componentes.find(c => c.nome == this.noRaiz.querySelector("#selectComponente").value);
                
                this.elemento_view.componente = this.componente.nome;

                //Cria um novo evento indicando dados do componente
                let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_VIEW, this.elemento_view);                    
                this.dispatchEvent(eventoCompleto);     
                                        
            };
        });
    }



    enviarEventoAtualizacaoElemento(){
                
        let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_ELEMENTO, {                                              
            componente:JSON.parse(JSON.stringify(this.componente)),
            dados: JSON.parse(JSON.stringify(this.dados)),
            id: this._id,                    
        });    

        this.dispatchEvent(eventoCompleto);  
    }



    static get observedAttributes() {
        return ['id','id_view'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {


        if (nomeAtributo.localeCompare("id") == 0){

            this._id = Number(novoValor);
            this.renderizar();


        }else if (nomeAtributo.localeCompare("id_view") == 0){

            this._id_view = Number(novoValor);
            this.renderizar();
        }
    }



    renderizar(){

        //Se possui o id do elemento e da View
        if (this._id && this._id_view){

            Promise.all([

                //Recupera o elemento global
                UltimaDAO.getInstance().elemento(this._id),

                //Recupera detalhes do elemento na view
                UltimaDAO.getInstance().elemento_view (this._id_view, this._id)

            ]).then (retornos => {

                [this.elemento, this.elemento_view] = [...retornos];
                
                //Recupera detalhes do componente HTML a ser renderizado
                UltimaDAO.getInstance().componente (this.elemento_view.componente).then(componente => {

                    let deveCarregar = true;

                    if (this.componente){
                        if (this.componente.nome == componente.nome){
                            deveCarregar = false;
                        }
                    }
                    if (deveCarregar && !this.carregandoComponente){
                        this.componente = componente;
                        this.carregarComponente();
                    }
                });                
            });
        }
        
        if (this.instanciaComponente &&  this.elemento){                                                
            this.instanciaComponente.setAttribute("dados", JSON.stringify(this.elemento.dados));            
        }

        if (this.editorDados && this.elemento){
            this.editorDados.setAttribute("dados", JSON.stringify(this.elemento.dados));
        }
    }



    carregarComponente(){

        if (this.carregado){

            this.carregandoComponente = true;

            //Se é uma URL relativa, usa o prefixo de endereço preenchido pelo ComponenteBase
            //Caso contrário usa a própria url
            let url = (this.componente.url.startsWith('/') ? (super.prefixoEndereco + this.componente.url) : this.componente.url);
            
            //Carrega dinamicamente o componente
            import(url).then(modulo => {

                this.instanciaComponente = document.createElement(this.componente.nome);
                this.noRaiz.querySelector("#containerComponente").appendChild(this.instanciaComponente);


                this.instanciaComponente.classList.add('componente');            


                this.instanciaComponente.addEventListener("change", evento => {

                    //Para a propagaçaõ do evento do componente
                    evento.stopPropagation();
                
                    this.dados = evento.detail;

                    this.enviarEventoAtualizacaoElemento();               
                });

               


                this.instanciaComponente.addEventListener(UltimaEvento.EVENTO_SELECAO_OBJETO, evento => {

                    //Para a propagaçaõ do evento do componente
                    evento.stopPropagation();
                
                    //Cria um novo evento indicando dados do componente
                    let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_SELECAO_OBJETO, {                                                                      
                            id_origem: this._id,                    
                            dados:evento.detail,
                    });
                    
                    this.dispatchEvent(eventoCompleto);                
                });
                
                this.carregandoComponente = false;
                this.renderizar();
            });
        }
    }



    adicionarComportamentoBotoesElementoTreemap(){

        this.noRaiz.querySelector("#configuracao").addEventListener("click", ()=>{
            this.configuracao(true);
        });
        this.noRaiz.querySelector("#voltar").addEventListener("click", ()=>{
            this.configuracao(false);
        });
        this.noRaiz.querySelector("#aumentar").addEventListener("click", ()=>{
            this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_AUMENTAR, {detail:this._id}));
        });
        this.noRaiz.querySelector("#diminuir").addEventListener("click", ()=>{
            this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_DIMINUIR, {detail:this._id}));
        });
        this.noRaiz.querySelector("#irParaTras").addEventListener("click", ()=>{
            this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_IR_PARA_TRAS, {detail:this._id}));
        });
        this.noRaiz.querySelector("#irParaFrente").addEventListener("click", ()=>{
            this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_IR_PARA_FRENTE, {detail:this._id}));
        });
        this.noRaiz.querySelector("#irParaInicio").addEventListener("click", ()=>{
            this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_IR_PARA_INICIO, {detail:this._id}));
        });
        this.noRaiz.querySelector("#irParaFim").addEventListener("click", ()=>{
            this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_IR_PARA_FIM, {detail:this._id}));
        });
        this.noRaiz.querySelector("#maximizar").addEventListener("click", ()=>{
            this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_MAXIMIZAR, {detail:this._id}));
        });
        this.noRaiz.querySelector("#restaurar").addEventListener("click", ()=>{
            this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_RESTAURAR, {detail:this._id}));
        });
        this.noRaiz.querySelector("#minimizar").addEventListener("click", ()=>{
            this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_MINIMIZAR, {detail:this._id}));
        });
        this.noRaiz.querySelector("#fechar").addEventListener("click", ()=>{
            this.dispatchEvent (new CustomEvent(ElementoTreeMap.EVENTO_FECHAR, {detail:this._id}));
        });                    
    }
}
customElements.define('elemento-treemap', ElementoTreeMap);