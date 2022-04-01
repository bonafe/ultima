import { ComponenteBase } from "../componente_base.js";
import { UltimaEvento } from "./ultima_evento.js";
import { UltimaDBWriter } from "./db/ultima_db_writer.js";
import { UltimaDBReader } from "./db/ultima_db_reader.js";
import { UltimaTreemapView } from "./view/treemap/ultima_treemap_view.js";



export class UltimaJS extends ComponenteBase{    



    constructor(){
        super({templateURL:"./ultima_js.html", shadowDOM:true}, import.meta.url);        

        this.configuracoesCarregadas = false;

        this.addEventListener('carregou', () => {
            
            this.renderizar();            
        });
    }



    renderizar(){

        if (this.renderizado && (!this.estilosCarregados) && (this.estilos)){
            this.carregarEstilos();
        
        //TODO: Deve alterar a exibição caso um novo arquivo seja carregado
        }else if (this.carregado && this.configuracoesCarregadas && !this.renderizado){

            this.carregarControladores().then(()=>{

                UltimaDBReader.getInstance().views().then (views => {
                    
                    this.views  = views;

                    this.criarEIniciarControleNavegadorTreemap();

                    if (this.estilos){
                        this.carregarEstilos().then(()=>{
                            this.renderizado = true;    
                        });
                    }else{        
                        this.renderizado = true;
                    }     
                });                                                             
            });
        }       
    }



    carregarControladores(){
        return new Promise ((resolve, reject) => {
            UltimaDBReader.getInstance().controladores().then (controladores => {
                    
                this.controladores  = controladores;

                Promise.all(
                    this.controladores.map (controlador => 
                        new Promise((resolveC, rejectC) => {

                            //Componentes com URL Relativa são carregados a partir do diretório raiz do Ultima
                            //O diretório raiz é calculado partindo-se de está esta classe UltimaElemento
                            let url_raiz_ultima =  new URL("../../",ComponenteBase.extrairCaminhoURL(import.meta.url));

                            //Carrega dinamicamente o componente
                            import(ComponenteBase.resolverEndereco(controlador.url, url_raiz_ultima.href)).then(modulo => {

                                controlador.instanciaControlador = new modulo[controlador.nome_classe]();                    
                                //controlador.instanciaControlador.addEventListener (UltimaEvento.EXECUTAR_ACAO, evento => this.executarAcao.bind(this)(evento.detail));
                                resolveC(true);
                            });
                        })
                    )
                ).then(()=>resolve(true));
            });
        });
    }



    enviarEventoParaControladores(evento){
        this.controladores.forEach (controlador => {
            controlador.instanciaControlador.processarEvento (evento);
        });
    }



    carregarEstilos(){
        return new Promise ((resolve, reject) => {            
            this.carregarCSS(this.estilos).then(()=>{
                this.estilosCarregados = true;        
                resolve(true);
            });            
        });
    }

    

    static get observedAttributes() {
        return ['src', 'estilos'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {
        
        //URL do arquivo de configuração
        if (nomeAtributo.localeCompare("src") == 0){
            
            this._src = novoValor;
            fetch(this._src)
                .then (response => response.json())
                .then(configuracao => this.carregarConfiguracao(configuracao));                     


        }else  if (nomeAtributo.localeCompare("estilos") == 0){

            this.estilosCarregados = false;
            this.estilos = novoValor;
            this.renderizar();        

        }
    }



    carregarConfiguracao(configuracao){

        UltimaDBReader.getInstance().views().then (views => {

            //Caso não existam views na base [1ª Vez]
            if (views.length == 0){

                this.views = configuracao.views;

                console.log ("carregando configuracao do arquivo");

                Promise.all([
                    UltimaDBWriter.getInstance().atualizarElementos(configuracao.elementos),
                    UltimaDBWriter.getInstance().atualizarComponentes(this.gerarCaminhoAbsolutoURL(configuracao.componentes)),
                    UltimaDBWriter.getInstance().atualizarAcoes(configuracao.acoes),
                    UltimaDBWriter.getInstance().atualizarControladores(this.gerarCaminhoAbsolutoURL(configuracao.controladores)),
                    UltimaDBWriter.getInstance().atualizarView(this.views[0])
                ]).then (respostas => {        
                    this.configuracoesCarregadas = true;                            
                    this.renderizar();              
                });

            //Se existirem views na base não recarrega
            //TODO: precisa tratar mudança de versão, colocar versão no arquivo de configuração e fazer merge das configurações se for atualizado
            }else{

                this.configuracoesCarregadas = true;        
                this.renderizar();
            }
        });        
    }

    gerarCaminhoAbsolutoURL(lista){
        return lista.map(elemento => {
            if (elemento.url){
                elemento.url = ComponenteBase.resolverEndereco(elemento.url, ComponenteBase.extrairCaminhoURL(this._src)).href;
            }
            return elemento;
        })
    }

    
    criarEIniciarControleNavegadorTreemap(){
        this.controleNavegador = this.noRaiz.querySelector("ultima-treemap-view");
            
        //TODO: só está pegando a primeira view
        this.controleNavegador.view = JSON.parse(JSON.stringify(this.views[0]));
                                    
        [               
            {evento:UltimaEvento.EVENTO_SELECAO_OBJETO},

            {evento:UltimaEvento.EVENTO_VIEW_ATUALIZADA},

            {evento:UltimaEvento.EXECUTAR_ACAO, funcao:this.executarAcao.bind(this)},

            //Eventos direcionados para o controle navegador
            //TODO: poder ter vários controladores de containeres de navegação            
            {evento:UltimaEvento.EVENTO_ATUALIZACAO_VIEW, funcao:this.atualizarView.bind(this)},            

            //Eventos tratados diretamente pelo ultima-view                                    
            {evento:UltimaEvento.EVENTO_ATUALIZACAO_ELEMENTO, funcao:this.atualizacaoElemento.bind(this)},

            {evento:UltimaEvento.EVENTO_ELEMENTO_ATUALIZADO, funcao:this.elementoAtualizado.bind(this)}

        ].forEach (objetoEventoMonitorado => {                        

            this.addEventListener (objetoEventoMonitorado.evento, evento => {
                if (objetoEventoMonitorado.evento == UltimaEvento.EXECUTAR_ACAO){
                    console.log ("************************************** CHEGOU EVENTO this");                
                }
                this.processarEvento (evento, objetoEventoMonitorado);
            });

            this.controladores.forEach(controlador => {
                controlador.instanciaControlador.addEventListener (objetoEventoMonitorado.evento, evento => {
                    if (objetoEventoMonitorado.evento == UltimaEvento.EXECUTAR_ACAO){
                        console.log ("************************************** CHEGOU EVENTO controlador");                
                    }
                    this.processarEvento (evento, objetoEventoMonitorado);
                });
            })
        });                                   
    }
    
    processarEvento (evento, objetoEventoMonitorado){
        this.enviarEventoParaControladores (evento);
        if (objetoEventoMonitorado.funcao){
            return objetoEventoMonitorado.funcao(evento.detail);
        }
    }

    executarAcao(acao){

        //Cria um dicionário com as ações disponíveis e as respectivas funções que as executam
        let relacao_acao_funcao = {        
            [UltimaEvento.ACAO_REINICIAR.nome]:this.reiniciar.bind(this),
            [UltimaEvento.ACAO_ADICIONAR_ELEMENTO.nome]:this.adicionarElemento.bind(this),
            [UltimaEvento.ACAO_AUMENTAR_ELEMENTO.nome]:this.controleNavegador.aumentar.bind(this.controleNavegador),
            [UltimaEvento.ACAO_DIMINUIR_ELEMENTO.nome]:this.controleNavegador.diminuir.bind(this.controleNavegador),
            [UltimaEvento.ACAO_MAXIMIZAR_ELEMENTO.nome]:this.controleNavegador.maximizar.bind(this.controleNavegador),
            [UltimaEvento.ACAO_MINIMIZAR_ELEMENTO.nome]:this.controleNavegador.minimizar.bind(this.controleNavegador),
            [UltimaEvento.ACAO_RESTAURAR_ELEMENTO.nome]:this.controleNavegador.restaurar.bind(this.controleNavegador),
            [UltimaEvento.ACAO_FECHAR_ELEMENTO.nome]:this.controleNavegador.fechar.bind(this.controleNavegador),
            [UltimaEvento.ACAO_IR_PARA_TRAS_ELEMENTO.nome]:this.controleNavegador.irParaTras.bind(this.controleNavegador),
            [UltimaEvento.ACAO_IR_PARA_FRENTE_ELEMENTO.nome]:this.controleNavegador.irParaFrente.bind(this.controleNavegador),
            [UltimaEvento.ACAO_IR_PARA_INICIO_ELEMENTO.nome]:this.controleNavegador.irParaInicio.bind(this.controleNavegador),
            [UltimaEvento.ACAO_IR_PARA_FIM_ELEMENTO.nome]:this.controleNavegador.irParaFim.bind(this.controleNavegador)
        };

        //Chava a função correspondente a ação passando os parâmetros dela
        relacao_acao_funcao[acao.nome](acao.parametros);        
    }


    reiniciar(){
        UltimaDBWriter.getInstance().reiniciarBase().then(() => {
            //TODO: está recarregando tudo
            document.location.reload(true);
        });                
    }

    atualizarView(detalhes){        
        let uuid_view = detalhes.uuid_view;

        //TODO: considerando apenas um container (nome antigo: view)
        UltimaDBWriter.getInstance().atualizarView(this.controleNavegador.view).then(()=>{

            //Persistiu a atualização na base
            this.dispatchEvent(new UltimaEvento(UltimaEvento.EVENTO_VIEW_ATUALIZADA,{"uuid_view":uuid_view}));
        });
    }                                                               



    atualizacaoElemento(detalhe){

        UltimaDBReader.getInstance().elemento_view(detalhe.uuid_view, detalhe.uuid_elemento_view).then (elemento_view => {

            if (elemento_view.componente == "configuracao-ultima"){

                this.atualizarConfiguracao(detalhe);

            }else{

                UltimaDBReader.getInstance().elemento(detalhe.uuid_elemento).then (elemento => {

                    elemento.dados = detalhe.dados;
                    
                    UltimaDBWriter.getInstance().atualizarElemento(elemento).then(()=>{

                        let eventoCompleto = new UltimaEvento(UltimaEvento.EVENTO_ELEMENTO_ATUALIZADO, {                                    
                            uuid_elemento:detalhe.uuid_elemento,
                            uuid_view:detalhe.uuid_view,
                            uuid_elemento_view:detalhe.uuid_elemento_view,
                            dados:JSON.parse(JSON.stringify(elemento.dados))
                        });    
                                        
                        this.dispatchEvent(eventoCompleto);
                    });
                });                                                        
            }
        });
    }



    elementoAtualizado(detalhe){
        
        this.controleNavegador.atualizarElemento (detalhe.uuid_elemento);                                                     
    }



    adicionarElemento(detalhe){

        let uuid_novo_elemento = window.crypto.randomUUID();
        let uuid_novo_elemento_view = window.crypto.randomUUID();

        let novo_elemento = {                        
            "uuid": uuid_novo_elemento,
            "nome": detalhe.nome_elemento,            
            "dados": detalhe.dados
        };
        let novo_elemento_view = {
            "uuid": uuid_novo_elemento_view,
            "uuid_elemento": uuid_novo_elemento,                     
            "importancia": this.mediaImportancia(this.views[0].elementos),
            "componente": detalhe.nome_componente
        };

        this.views[0].elementos.push(novo_elemento_view);

        UltimaDBWriter.getInstance().atualizarElemento(novo_elemento).then( retorno => {
            UltimaDBWriter.getInstance().atualizarView(this.views[0]).then( retorno => {
                this.controleNavegador.adicionarElemento(novo_elemento_view);
            });
        })             
    }

    mediaImportancia(elementos){
        const soma = elementos.reduce((valorAnterior, elementoAtual) => valorAnterior + elementoAtual.importancia, 0);
        const media = (soma / elementos.length) || 0;
        return media;
    }



   







    configuracao(){

        let configuracaoUltima = this.views[0].elementos.find (e => e.componente.nome == "configuracao-ultima");

        if (configuracaoUltima){
            alert ("Já está aberta a configuração!");
        }else{  

            Promise.all([
                UltimaDBReader.getInstance().componentes(),
                UltimaDBReader.getInstance().acoes(),    
                UltimaDBReader.getInstance().elementos(),
                UltimaDBReader.getInstance().views()])
            .then(retornos => {

                const [componentes, acoes, elementos, views] = retornos;

                this.adicionarElemento ({
                    nome_elemento:"Configuração Última",
                    nome_componente:"configuracao-ultima",
                    dados:{                    
                        componentes: JSON.parse(JSON.stringify(componentes)),                  
                        acoes: JSON.parse(JSON.stringify(acoes)),                    
                        elementos: JSON.parse(JSON.stringify(elementos)),                    
                        views: JSON.parse(JSON.stringify(views))                    
                    }
                });
            });                                  
        }
    }



    



    atualizarConfiguracao(elementoConfiguracao){
        
        elementoConfiguracao.dados.view.elementos.forEach(elemento_configuracao => {

            let elemento_atualizado = JSON.parse(JSON.stringify(elemento_configuracao));

            //Encontra o índice do elemento da configuração aqui no array de elementos da view
            let indice = this.view.elementos.map(e => e.uuid).indexOf (elemento_atualizado.uuid);                                    

            //Remove o elemento atual da view da posição
            let [elemento_view] = this.view.elementos.splice(indice,1);

            //Coloca uma cópia atualizada em seu lugar
            
            this.view.elementos.splice(indice,0,elemento_atualizado);

            this.controleNavegador.atualizarElemento(elemento_atualizado);
        });

        //Persiste a view atualizada
        UltimaDBWriter.getInstance().atualizarView(this.view);
    }
}
customElements.define('ultima-js', UltimaJS);