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
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_AUMENTAR_ELEMENTO.nome, {"id_elemento_container":this._id});            
        });

        this.noRaiz.querySelector("#diminuir").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_DIMINUIR_ELEMENTO.nome, {"id_elemento_container":this._id});            
        });

        this.noRaiz.querySelector("#irParaTras").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_IR_PARA_TRAS_ELEMENTO.nome, {"id_elemento_container":this._id});             
        });

        this.noRaiz.querySelector("#irParaFrente").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_IR_PARA_FRENTE_ELEMENTO.nome, {"id_elemento_container":this._id});            
        });

        this.noRaiz.querySelector("#irParaInicio").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_IR_PARA_INICIO_ELEMENTO.nome, {"id_elemento_container":this._id});            
        });

        this.noRaiz.querySelector("#irParaFim").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_IR_PARA_FIM_ELEMENTO.nome, {"id_elemento_container":this._id});              
        });

        this.noRaiz.querySelector("#maximizar").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_MAXIMIZAR_ELEMENTO.nome, {"id_elemento_container":this._id}); 
        });

        this.noRaiz.querySelector("#restaurar").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_RESTAURAR_ELEMENTO.nome, {"id_elemento_container":this._id});
        });

        this.noRaiz.querySelector("#minimizar").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_MINIMIZAR_ELEMENTO.nome, {"id_elemento_container":this._id});
        });

        this.noRaiz.querySelector("#fechar").addEventListener("click", ()=>{
            UltimaEvento.dispararEventoExecutarAcao(this, 
                UltimaEvento.ACAO_FECHAR_ELEMENTO.nome, {"id_elemento_container":this._id});
        });                    
    }
}