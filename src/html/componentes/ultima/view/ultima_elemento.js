import { ComponenteBase } from '../../componente_base.js';
import { UltimaEvento } from '../ultima_evento.js';
import { UltimaDBReader } from "../db/ultima_db_reader.js";


export class UltimaElemento extends ComponenteBase {

    constructor(){
        super({templateURL:"./ultima_elemento.html", shadowDOM:true}, import.meta.url);

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

                        this.dados = evento.detail;
                        this.enviarEventoAtualizacaoElemento();    
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
            uuid_elemento:this.elemento.uuid,
            uuid_view:this._uuid_view,
            uuid_elemento_view:this._uuid,
            dados:JSON.parse(JSON.stringify(this.dados))
        });    

        this.dispatchEvent(eventoCompleto);  
    }

    enviarEventoSelecaoObjeto(evento){
                
        let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_SELECAO_OBJETO, {                                    
            id_elemento_origem:this.elemento.id,
            id_view_origem:this._uuid_view,
            id_elemento_view_origem:this._uuid,
            dados:JSON.parse(JSON.stringify(evento.detail))
        });    

        this.dispatchEvent(eventoCompleto);  
    }



    static get observedAttributes() {
        return ['uuid_elemento_view','uuid_view'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {


        if (nomeAtributo.localeCompare("uuid_elemento_view") == 0){

            this._uuid = novoValor;
            this.renderizar();


        }else if (nomeAtributo.localeCompare("uuid_view") == 0){

            this._uuid_view = novoValor;
            this.renderizar();
        }
    }



    renderizar(){

        //Se possui o id do elemento e da View
        if (this._uuid && this._uuid_view){
            
            //Recupera detalhes do elemento na view
            UltimaDBReader.getInstance().elemento_view (this._uuid_view, this._uuid).then (elemento_view => {

                this.elemento_view = elemento_view;

                //Recupera o elemento global
                UltimaDBReader.getInstance().elemento(this.elemento_view.uuid_elemento).then (elemento => {

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
            if (this.elemento.dados){                                              
                this.instanciaComponente.setAttribute("dados", JSON.stringify(this.elemento.dados));            
            }
        }

        if (this.editorDados && this.elemento){
            if (this.elemento.dados){                                              
                this.editorDados.setAttribute("dados", JSON.stringify(this.elemento.dados));
            }
        }
    }



    carregarComponente(){

        if (this.carregado){

            this.carregandoComponente = true;
      
            //Componentes com URL Relativa são carregados a partir do diretório raiz do Ultima
            //O diretório raiz é calculado partindo-se de está esta classe UltimaElemento
            let url_raiz_ultima =  new URL("../../../",ComponenteBase.extrairCaminhoURL(import.meta.url));

            //Carrega dinamicamente o componente
            import(ComponenteBase.resolverEndereco(this.componente.url, url_raiz_ultima.href)).then(modulo => {

                this.instanciaComponente = document.createElement(this.componente.nome);
                this.noRaiz.querySelector("#containerComponente").appendChild(this.instanciaComponente);


                this.instanciaComponente.classList.add('componente');            


                //Passa para frente a mudança de valor do elemento colocando os ids da view e do elemento view
                this.instanciaComponente.addEventListener("change", evento => {

                    //Para a propagaçaõ do evento do componente
                    evento.stopPropagation();
                
                    this.dados = evento.detail;

                    this.enviarEventoAtualizacaoElemento();               
                });

                //Passa para frente o evento de seleção de objeto colocando os ids da view e do elemento view
                this.instanciaComponente.addEventListener(UltimaEvento.EVENTO_SELECAO_OBJETO, evento => {

                    //Para a propagaçaõ do evento do componente
                    evento.stopPropagation();
                
                    this.enviarEventoSelecaoObjeto(evento);
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
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_AUMENTAR_ELEMENTO.nome, {"uuid_elemento_view":this._uuid});            
        });

        this.noRaiz.querySelector("#diminuir").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_DIMINUIR_ELEMENTO.nome, {"uuid_elemento_view":this._uuid});            
        });

        this.noRaiz.querySelector("#irParaTras").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_IR_PARA_TRAS_ELEMENTO.nome, {"uuid_elemento_view":this._uuid});             
        });

        this.noRaiz.querySelector("#irParaFrente").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_IR_PARA_FRENTE_ELEMENTO.nome, {"uuid_elemento_view":this._uuid});            
        });

        this.noRaiz.querySelector("#irParaInicio").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_IR_PARA_INICIO_ELEMENTO.nome, {"uuid_elemento_view":this._uuid});            
        });

        this.noRaiz.querySelector("#irParaFim").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_IR_PARA_FIM_ELEMENTO.nome, {"uuid_elemento_view":this._uuid});              
        });

        this.noRaiz.querySelector("#maximizar").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_MAXIMIZAR_ELEMENTO.nome, {"uuid_elemento_view":this._uuid}); 
        });

        this.noRaiz.querySelector("#restaurar").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_RESTAURAR_ELEMENTO.nome, {"uuid_elemento_view":this._uuid});
        });

        this.noRaiz.querySelector("#minimizar").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_MINIMIZAR_ELEMENTO.nome, {"uuid_elemento_view":this._uuid});
        });

        this.noRaiz.querySelector("#fechar").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_FECHAR_ELEMENTO.nome, {"uuid_elemento_view":this._uuid});
        });                    
    }
}