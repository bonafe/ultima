import { ComponenteBase } from "../componente_base.js";
import { Evento } from "./evento.js";
import { EscritorEspacoDB } from "./modelo/escritor_espaco_db.js";
import { LeitorEspacoDB } from "./modelo/leitor_espaco_db.js";
import { VisualizadorTreemap } from "./visualizacao/treemap/visualizador_treemap.js";
import { VisualizadorJanelas } from "./visualizacao/janela/visualizador_janelas.js";



/**
 * Representa um espaço de trabalho do Ultima 
 */
export class Espaco extends ComponenteBase{    


    static VIZUALIZADORES_DISPONIVEIS = ["visualizador-janelas", "visualizador-treemap"];

    /**
     * Carrega o template HTML que irá conter um visualizador de elementos.
     * Aguarda o evento 'carregou' para iniciar o carregamento das configurações
     *@constructor
     *@see carregarConfiguracao     
     */
    constructor(){
        
        super({templateURL:"./espaco.html", shadowDOM:true}, import.meta.url);        

        this.renderizado = false;

        this.configuracoesCarregadas = false;

        //TODO: deve selecionar a visualização baseado no dispositivo
        this.indiceVisualizadorSelecionado = 1; // VIZUALIZADORES_DISPONIVEIS[1] = visualizador-treemap

        this.visualizador = undefined;

        this.addEventListener('carregou', () => {            

            //this.iniciarServiceWorkers();
            this.carregarConfiguracao();            
        });
    }


    /**
     * 
     * @param {Object} configuracao - Objeto com as configurações do Ultima
     * @param {Array} configuracao.visualizacoes - Array de visualizações
     * @param {Array} configuracao.elementos - Array de elementos
     * @param {Array} configuracao.componentes - Array de componentes
     * @param {Array} configuracao.acoes - Array de ações
     * @param {Array} configuracao.controladores - Array de controladores
     * @param {Array} configuracao.visualizacao - Array de visualizações
     *      
     **/
    carregarConfiguracao(configuracao){

        //LeitorEspacoDB extende EspacoDB que é uma base de dados que ao iniciar 
        //carrega configurações padrão de componentes e controladores
        LeitorEspacoDB.getInstance().visualizacoes().then (visualizacoes => {

            //Se existirem visualizacoes na base não recarrega
            //TODO: precisa tratar mudança de versão, colocar versão no 
            //arquivo de configuração e fazer merge das configurações se for atualizado        
            if (visualizacoes.length > 0){

                //Uma das condições para renderização é que as configurações estejam carregadas
                this.configuracoesCarregadas = true;        
                this.renderizar();


            //Caso não existam visualizacoes na base [1ª Vez]
            }else{

                //Caso um arquivo de configuração tenha sido passado como parâmetro
                if (configuracao){

                    //Carrega as visualizacoes a partir do arquivo de configuração
                    this.visualizacoes = configuracao.visualizacoes;

                    console.log ("Carregando configuracao do arquivo");

                    //Escreve todas as configurações do novo arquivo de configurações na base de dados
                    Promise.all([
                        EscritorEspacoDB.getInstance().atualizarElementos(configuracao.elementos),
                        EscritorEspacoDB.getInstance().atualizarComponentes(this.gerarCaminhoAbsolutoURL(configuracao.componentes)),
                        EscritorEspacoDB.getInstance().atualizarAcoes(configuracao.acoes),
                        EscritorEspacoDB.getInstance().atualizarControladores(this.gerarCaminhoAbsolutoURL(configuracao.controladores)),

                        //TODO: está selecionado automaticamente a primeira visualização 
                        //TODO: A visualização escolhida deveria ser a do último estado da aplicação
                        //TODO: Dessa forma a aplicação sempre continua de onde parou
                        EscritorEspacoDB.getInstance().atualizarVisualizacao(this.visualizacoes[0])


                    ]).then (respostas => {

                        this.configuracoesCarregadas = true;

                        this.renderizar();
                    });

                
                //Caso nenhum arquivo de configuração tenha sido passado
                }else{
                    
                    //Cria uma visualizacao vazia e entra no modo de configuração
                    let nova_visualizacao = {
                        "uuid": window.crypto.randomUUID(),
                        "descricao": "Nova visualizacao",
                        "acoes": [],
                        "elementos": []
                    };

                    //Persiste na base local a visualização que acabamos de criar
                    EscritorEspacoDB.getInstance().atualizarVisualizacao(nova_visualizacao).then(resposta =>{


                        this.visualizacoes = [nova_visualizacao];

                        this.configuracoesCarregadas = true;                 

                        //Entra automaticamente na configuração
                        this.configuracao();
                    });                                      
                }
            }
        });        
    }



    mudarView(){
        this.indiceVisualizadorSelecionado = (this.indiceVisualizadorSelecionado + 1) % Espaco.VIZUALIZADORES_DISPONIVEIS.length;
        this.criarEIniciarControleNavegador();
    }



    renderizar(){

        //TODO: Deve alterar a exibição caso um novo arquivo seja carregado
        if (super.carregado && this.configuracoesCarregadas && !this.renderizado){

            this.carregarControladores().then(()=>{

                LeitorEspacoDB.getInstance().visualizacoes().then (visualizacoes => {
                    
                    this.visualizacoes  = visualizacoes;

                    this.criarAcoes();

                    this.criarEIniciarControleNavegador();
                    
                    this.renderizado = true;
                });                                                             
            });
        }       
    }



    criarAcoes(){
        super.noRaiz.querySelector("#fullscreen").addEventListener("click", () => {
            window.openFullscreen();
        });
    
        super.noRaiz.querySelector("#configuracao").addEventListener("click", () => {
          this.configuracao();
        });
    
        super.noRaiz.querySelector("#ajuda").addEventListener("click", () => {
          alert (`Última Versão: ${EspacoDB.VERSAO}`);
        });
    
        super.noRaiz.querySelector("#mudarView").addEventListener("click", () => {
          this.mudarView();
        });
    }

    

    // Importa e instancia classes de controladores a partir das informações que 
    // estão armazenadas localmente no IndexDB, retorna um array de promises que resolve
    // quando todas forem carregadas
    carregarControladores(){

        return new Promise ((resolve, reject) => {
            
            LeitorEspacoDB.getInstance().controladores().then (controladores => {
                    
                this.controladores  = controladores;

                //Cria um array de Promises com cada carregamento de Controlador
                Promise.all(

                    //Para cada controlador
                    this.controladores.map (controlador => 

                        //Cria um promise
                        new Promise((resolveC, rejectC) => {

                            //Componentes com URL Relativa são carregados a partir do diretório raiz do Ultima
                            //O diretório raiz é calculado partindo-se de está esta classe UltimaElemento
                            let url_raiz_ultima =  new URL("../../",ComponenteBase.extrairCaminhoURL(import.meta.url));

                            //Carrega dinamicamente o modulo do componente do controlador
                            import(ComponenteBase.resolverEndereco(controlador.url, url_raiz_ultima.href)).then(modulo => {

                                //Cria uma nova instância desse componente
                                controlador.instanciaControlador = new modulo[controlador.nome_classe]();                                                    
                                
                                //Sinaliza que a promise foi resolvida
                                resolveC(true);
                            });
                        })
                    )

                //Quando todos os controladores forem carregados, resolve a promise
                ).then(()=>resolve(true));
            });
        });
    }



    criarEIniciarControleNavegador(){

        if (this.visualizador){
            this.visualizador.remover();            
        }

        let containerVisualizador = super.noRaiz.querySelector(".secao_principal_ultima");

        //Cria um novo HTMLElement baseado no indice do visualizador selecionado
        this.visualizador = document.createElement(
            Espaco.VIZUALIZADORES_DISPONIVEIS[this.indiceVisualizadorSelecionado]
        );
        
        containerVisualizador.appendChild(this.visualizador);
            


        //TODO: só está pegando a primeira visualizacao
        this.visualizador.visualizacao = {...this.visualizacoes[0]};
               
        //Percorre alguns eventos pré-definidos criando monitoramento para eles
        [               
            {evento:Evento.EVENTO_SELECAO_OBJETO},

            {evento:Evento.EVENTO_VISUALIZACAO_ATUALIZADA},

            {evento:Evento.EXECUTAR_ACAO, funcao:this.executarAcao.bind(this)},

            //Eventos direcionados para o controle navegador
            //TODO: poder ter vários controladores de containeres de navegação            
            {evento:Evento.EVENTO_ATUALIZACAO_VISUALIZACAO, funcao:this.atualizarVisualizacao.bind(this)},            

            //Eventos tratados diretamente pelo ultima-visualizacao                                    
            {evento:Evento.EVENTO_ATUALIZACAO_ELEMENTO, funcao:this.atualizacaoElemento.bind(this)},

            {evento:Evento.EVENTO_ELEMENTO_ATUALIZADO, funcao:this.elementoAtualizado.bind(this)}

        ].forEach (objetoEventoMonitorado => {                        

            this.addEventListener (objetoEventoMonitorado.evento, evento => {

                this.processarEvento (evento, objetoEventoMonitorado);
            });

            //Monitora eventos dos controladores
            this.controladores.forEach(controlador => {
                controlador.instanciaControlador.addEventListener (objetoEventoMonitorado.evento, evento => {
                    if (objetoEventoMonitorado.evento == Evento.EXECUTAR_ACAO){
                        console.log ("************************************** CHEGOU EVENTO controlador");                
                    }
                    this.processarEvento (evento, objetoEventoMonitorado);
                });
            })
        });                                   
    }




    



    //Quando chega um evento ele será propagado para todos os controladores
    enviarEventoParaControladores(evento){
        this.controladores.forEach (controlador => {
            controlador.instanciaControlador.processarEvento (evento);
        });
    }



  

    

    static get observedAttributes() {
        return ['src'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {
        
        //URL do arquivo de configuração
        if (nomeAtributo.localeCompare("src") == 0){
            
            this._src = novoValor;
            fetch(this._src)
                .then (response => response.json())
                .then(configuracao => this.carregarConfiguracao(configuracao));                     


        }
    }



    

    gerarCaminhoAbsolutoURL(lista){
        return lista.map(elemento => {
            if (elemento.url){
                elemento.url = ComponenteBase.resolverEndereco(elemento.url, ComponenteBase.extrairCaminhoURL(this._src)).href;
            }
            return elemento;
        })
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
            
            [Evento.ACAO_REINICIAR.nome]:this.reiniciar.bind(this),
            [Evento.ACAO_ADICIONAR_ELEMENTO.nome]:this.adicionarElemento.bind(this),

            [Evento.ACAO_AUMENTAR_ELEMENTO.nome]:this.visualizador.aumentar.bind(this.visualizador),
            [Evento.ACAO_DIMINUIR_ELEMENTO.nome]:this.visualizador.diminuir.bind(this.visualizador),
            [Evento.ACAO_MAXIMIZAR_ELEMENTO.nome]:this.visualizador.maximizar.bind(this.visualizador),
            [Evento.ACAO_MINIMIZAR_ELEMENTO.nome]:this.visualizador.minimizar.bind(this.visualizador),
            [Evento.ACAO_RESTAURAR_ELEMENTO.nome]:this.visualizador.restaurar.bind(this.visualizador),
            [Evento.ACAO_FECHAR_ELEMENTO.nome]:this.visualizador.fechar.bind(this.visualizador),
            [Evento.ACAO_IR_PARA_TRAS_ELEMENTO.nome]:this.visualizador.irParaTras.bind(this.visualizador),
            [Evento.ACAO_IR_PARA_FRENTE_ELEMENTO.nome]:this.visualizador.irParaFrente.bind(this.visualizador),
            [Evento.ACAO_IR_PARA_INICIO_ELEMENTO.nome]:this.visualizador.irParaInicio.bind(this.visualizador),
            [Evento.ACAO_IR_PARA_FIM_ELEMENTO.nome]:this.visualizador.irParaFim.bind(this.visualizador)
        };

        //Chava a função correspondente a ação passando os parâmetros dela
        relacao_acao_funcao[acao.nome](acao.parametros);        
    }


    
    //Zera a base de dados local IndexDB e recarrega a página
    reiniciar(){
        EscritorEspacoDB.getInstance().reiniciarBase().then(() => {
            //TODO: está recarregando tudo
            document.location.reload(true);
        });                
    }



    //Atualiza a visualizacao no banco de dados local IndexDB
    atualizarVisualizacao(detalhes){        

        let uuid_visualizacao= detalhes.uuid_visualizacao;

        //TODO: considerando apenas um container
        EscritorEspacoDB.getInstance().atualizarVisualizacao(this.visualizador.visualizacao).then(()=>{

            //Persistiu a atualização na base
            this.dispatchEvent(new Evento(Evento.EVENTO_VISUALIZACAO_ATUALIZADA,{"uuid_visualizacao":uuid_visualizacao}));
        });
    }                                                               



    //Atualiza o elemento no banco de dados local IndexDB
    atualizacaoElemento(elementoViewAtualizado){

        LeitorEspacoDB.getInstance().elemento_view(elementoViewAtualizado.uuid_visualizacao, elementoViewAtualizado.uuid_elemento_visualizacao).then (elementoViewBanco => {

            //Para o componente configuracao-ultima, existe um tratamento especial pois ele atualiza a visualizacao
            if (elementoViewBanco.componente == "configuracao-ultima"){

                this.atualizarConfiguracao(elementoViewAtualizado);

            }else{

                //Lê o elemento que está base
                LeitorEspacoDB.getInstance().elemento(elementoViewAtualizado.uuid_elemento).then (elementoBanco => {

                    //Atualizar o elemento significa atualizar seus dados
                    elementoBanco.dados = elementoViewAtualizado.dados;
                    
                    EscritorEspacoDB.getInstance().atualizarElemento(elementoBanco).then(()=>{

                        //Dispara evento indicado que o elemento foi atualizado na base
                        let eventoElementoAtualizado = new Evento(Evento.EVENTO_ELEMENTO_ATUALIZADO, {     

                            uuid_elemento: elementoViewAtualizado.uuid_elemento, //O elemento que foi atualizado
                            uuid_visualizacao: elementoViewAtualizado.uuid_visualizacao, //A visualizacao que disparou a atualizado do elemento
                            uuid_elemento_visualizacao: elementoViewAtualizado.uuid_elemento_visualizacao, //O id desse elemento na visualizacao (a visualizacao pode exibir vários vezes o mesmo elemento)
                            dados:{...elementoBanco.dados} //Clona os dados para não serem alterados
                        });    
                                        
                        this.dispatchEvent(eventoElementoAtualizado);
                    });
                });                                                        
            }
        });
    }



    elementoAtualizado(detalhe){
        
        this.visualizador.atualizarElemento (detalhe.uuid_elemento);                                                     
    }



    adicionarElemento(configuracoes_elemento){

        //Cria um novo elemento
        let novo_elemento = {                        
            "uuid": window.crypto.randomUUID(),
            "nome": configuracoes_elemento.nome_elemento,            
            "dados": configuracoes_elemento.dados
        };        


        let novo_elemento_visualizacao = {
            "uuid": window.crypto.randomUUID(),
            "uuid_elemento": novo_elemento.uuid,                     
            "importancia": this.mediaImportancia(this.visualizacoes[0].elementos),
            "componente": configuracoes_elemento.nome_componente
        };

        //Cria um novo elemento na visualizacao
        this.visualizacoes[0].elementos.push(novo_elemento_visualizacao);

        //Cria o novo elemento na base
        EscritorEspacoDB.getInstance().atualizarElemento(novo_elemento).then( elemento_criado => {

            //Atualiza visualizacao na base
            EscritorEspacoDB.getInstance().atualizarVisualizacao(this.visualizacoes[0]).then( visualizacao_atualizada => {
                
                //Se existe um controle de navegação instanciado
                if (this.visualizador){

                    //Adiciona o novo elemento ao nosso controle de navegação
                    this.visualizador.adicionarElemento(novo_elemento_visualizacao);
                }
            });
        })             
    }

    mediaImportancia(elementos){
        const soma = elementos.reduce((valorAnterior, elementoAtual) => valorAnterior + elementoAtual.importancia, 0);
        const media = (soma / elementos.length) || 0;
        return media;
    }



    /********************************** */
    /***/ /* Configurações */ /******* */
    /********************************** */
    configuracao(){

        let configuracaoUltima = this.visualizacoes[0].elementos.find (e => e.componente.nome == "configuracao-ultima");

        if (configuracaoUltima){
            alert ("Já está aberta a configuração!");
        }else{  

            Promise.all([
                LeitorEspacoDB.getInstance().componentes(),
                LeitorEspacoDB.getInstance().acoes(),    
                LeitorEspacoDB.getInstance().elementos(),
                LeitorEspacoDB.getInstance().visualizacoes()])
            .then(retornos => {

                const [componentes, acoes, elementos, visualizacoes] = retornos;

                this.adicionarElemento ({
                    nome_elemento:"Configuração Última",
                    nome_componente:"configuracao-ultima",
                    dados:{                    
                        componentes: [...componentes],                  
                        acoes: [...acoes],                    
                        elementos: [...elementos],                    
                        visualizacoes: [...visualizacoes]                    
                    }
                });
            });                                  
        }
    }



    atualizarConfiguracao(elementoConfiguracao){
        
        elementoConfiguracao.dados.visualizacao.elementos.forEach(elemento_configuracao => {

            let elemento_atualizado = {...elemento_configuracao};

            //Encontra o índice do elemento da configuração aqui no array de elementos da visualizacao
            let indice = this.visualizacao.elementos.map(e => e.uuid).indexOf (elemento_atualizado.uuid);                                    

            //Remove o elemento atual da visualizacao da posição
            let [elemento_view] = this.visualizacao.elementos.splice(indice,1);

            //Coloca uma cópia atualizada em seu lugar
            
            this.visualizacao.elementos.splice(indice,0,elemento_atualizado);

            this.visualizador.atualizarElemento(elemento_atualizado);
        });

        //Persiste a visualizacao atualizada
        EscritorEspacoDB.getInstance().atualizarVisualizacao(this.visualizacao);
    }



    /********************************** */
    /***/ /* Service Worker */ /******* */
    /********************************** */
    iniciarServiceWorkers(){
        navigator.serviceWorker.register(super.resolverEndereco('./service_worker.js'))
            .then(function(registration) {
                console.log('Service Worker registrado! Escopo:', registration.scope);
            })
            .catch(function(error) {
                console.log('Falha no registro do Service Worker! Erro:', error);
            });
    }



}


//Registra a classe Espaco como o elemento HTML espaco-ultima
customElements.define('espaco-ultima', Espaco);


