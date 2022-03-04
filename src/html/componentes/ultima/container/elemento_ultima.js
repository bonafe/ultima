import { ComponenteBase } from '../../componente_base.js';
import { UltimaEvento } from '../ultima_evento.js';
import { UltimaDBReader } from "../db/ultima_db_reader.js";


export class ElementoUltima extends ComponenteBase {

    constructor(){
        super({templateURL:"/componentes/ultima/container/elemento_ultima.html", shadowDOM:true});

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

                        //TODO: Não deveria já renderizar pois o dado mudou?
                        //Talvez ficasse lento... teria que ter um término da mudança, ou confirmação?

                        //Cria um novo evento indicando dados do componente
                        let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ATUALIZACAO_ELEMENTO, {                        
                            id_elemento:this._id,
                            id_container:this._id_view
                        });                    
                        this.dispatchEvent(eventoCompleto);      
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
        UltimaDBReader.getInstance().componentes().then(componentes => {
            
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
            
            //Recupera detalhes do elemento na view
            UltimaDBReader.getInstance().elemento_view (this._id_view, this._id).then (elemento_view => {

                this.elemento_view = elemento_view;

                //Recupera o elemento global
                UltimaDBReader.getInstance().elemento(this.elemento_view.id_elemento).then (elemento => {

                    this.elemento = elemento;
            
                    //Recupera detalhes do componente HTML a ser renderizado
                    UltimaDBReader.getInstance().componente (this.elemento_view.componente).then(componente => {

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
            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_AUMENTAR, {"id_elemento_container":this._id}));
        });
        this.noRaiz.querySelector("#diminuir").addEventListener("click", ()=>{
            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_DIMINUIR, {"id_elemento_container":this._id}));
        });
        this.noRaiz.querySelector("#irParaTras").addEventListener("click", ()=>{
            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_IR_PARA_TRAS, {"id_elemento_container":this._id}));
        });
        this.noRaiz.querySelector("#irParaFrente").addEventListener("click", ()=>{
            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_IR_PARA_FRENTE, {"id_elemento_container":this._id}));
        });
        this.noRaiz.querySelector("#irParaInicio").addEventListener("click", ()=>{
            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_IR_PARA_INICIO, {"id_elemento_container":this._id}));
        });
        this.noRaiz.querySelector("#irParaFim").addEventListener("click", ()=>{
            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_IR_PARA_FIM, {"id_elemento_container":this._id}));
        });
        this.noRaiz.querySelector("#maximizar").addEventListener("click", ()=>{
            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_MAXIMIZAR, {"id_elemento_container":this._id}));
        });
        this.noRaiz.querySelector("#restaurar").addEventListener("click", ()=>{
            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_RESTAURAR, {"id_elemento_container":this._id}));
        });
        this.noRaiz.querySelector("#minimizar").addEventListener("click", ()=>{
            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_MINIMIZAR, {"id_elemento_container":this._id}));
        });
        this.noRaiz.querySelector("#fechar").addEventListener("click", ()=>{
            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_FECHAR, {"id_elemento_container":this._id}));
        });                    
    }
}