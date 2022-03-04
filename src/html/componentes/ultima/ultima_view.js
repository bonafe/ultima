import { ComponenteBase } from "../componente_base.js";
import { UltimaEvento } from "./ultima_evento.js";
import { UltimaDBWriter } from "./db/ultima_db_writer.js";
import { UltimaDBReader } from "./db/ultima_db_reader.js";
import { ContainerTreeMap } from "./container/treemap/container_treemap.js";

export class UltimaView extends ComponenteBase{    



    constructor(){        
        super({templateURL:"/componentes/ultima/ultima_view.html", shadowDOM:false});
        
        this.configuracoesCarregadas = false;

        this.addEventListener('carregou', () => {
            
            this.renderizar();            
        });
    }


    renderizar(){

        //TODO: Deve alterar a exibição caso um novo arquivo seja carregado
        if (this.carregado && this.configuracoesCarregadas && !this.renderizado){

            UltimaDBReader.getInstance().views().then (views => {
                
                this.views  = views;

                this.criarEIniciarControleNavegadorTreemap();

                this.criarEIniciarMenuDeAcoes();                    
            });
            
            this.renderizado = true;
        }         
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


    
    criarEIniciarControleNavegadorTreemap(){
        this.controleNavegador = this.noRaiz.querySelector("container-treemap");
            
        //TODO: só está pegando a primeira view
        this.controleNavegador.view = JSON.parse(JSON.stringify(this.views[0]));
                                    
        [            
            //Eventos direcionados para o controle navegador
            //TODO: poder ter vários controladores de containeres de navegação
            {evento:UltimaEvento.EVENTO_AUMENTAR, funcao:this.controleNavegador.aumentar.bind(this.controleNavegador)},
            {evento:UltimaEvento.EVENTO_DIMINUIR, funcao:this.controleNavegador.diminuir.bind(this.controleNavegador)},
            {evento:UltimaEvento.EVENTO_MAXIMIZAR, funcao:this.controleNavegador.maximizar.bind(this.controleNavegador)},
            {evento:UltimaEvento.EVENTO_MINIMIZAR, funcao:this.controleNavegador.minimizar.bind(this.controleNavegador)},
            {evento:UltimaEvento.EVENTO_RESTAURAR, funcao:this.controleNavegador.restaurar.bind(this.controleNavegador)},
            {evento:UltimaEvento.EVENTO_FECHAR, funcao:this.controleNavegador.fechar.bind(this.controleNavegador)},
            {evento:UltimaEvento.EVENTO_IR_PARA_TRAS, funcao:this.controleNavegador.irParaTras.bind(this.controleNavegador)},
            {evento:UltimaEvento.EVENTO_IR_PARA_FRENTE, funcao:this.controleNavegador.irParaFrente.bind(this.controleNavegador)},
            {evento:UltimaEvento.EVENTO_IR_PARA_INICIO, funcao:this.controleNavegador.irParaInicio.bind(this.controleNavegador)},
            {evento:UltimaEvento.EVENTO_IR_PARA_FIM, funcao:this.controleNavegador.irParaFim.bind(this.controleNavegador)},            
            {evento:UltimaEvento.EVENTO_MUDAR_VISUALIZACAO, funcao:this.controleNavegador.mudarVisualizacao.bind(this.controleNavegador)},
            {evento:UltimaEvento.EVENTO_ATUALIZACAO_VIEW, funcao:this.atualizarView.bind(this)},            

            //Eventos tratados diretamente pelo ultima-view            
            {evento:UltimaEvento.EVENTO_EXECUTAR_ACAO, funcao:this.executarAcao},
            {evento:UltimaEvento.EVENTO_SELECAO_OBJETO, funcao:this.seleciouObjeto},
            {evento:UltimaEvento.EVENTO_ATUALIZACAO_ELEMENTO, funcao:this.atualizacaoElemento}
        ].forEach (e => {
            
            this.addEventListener (e.evento, evento => e.funcao(evento.detail));
        });                                   
    }
    
    atualizarView(detalhes){        
        let id_container = detalhes.id_container;

        //TODO: considerando apenas um container (nome antigo: view)
        UltimaDBWriter.getInstance().atualizarView(this.controleNavegador.view).then(()=>{
            //Persistiu a atualização na base
        });
    }

    executarAcao(ultimaEvento){
        console.log (`evento EXECUTAR AÇÃO!!!!!!!!!!`);
        console.dir (ultimaEvento.detail);
        this.adicionarElemento("Adicionado","exibidor-iframe",{src:"https://www.youtube.com/embed/YkgkThdzX-8"});
    }



    selecionouObjeto(ultimaEvento){
        this.adicionarElemento (
            //Componente
            ultimaEvento.detail.elemento_origem.componente,
            //Dados
            ultimaEvento.detail.dados
        );
    }                                                                   



    atualizacaoElemento(detalhe){
        detalhe.id_elemento
        detalhe.id_container

        this.views[0].elementos.find (e => e.id == detalhe.id_elemento);
        UltimaDBReader.getInstance().elemento_view(ultimaEvento.detail.id_view,ultimaEvento.detail.id).then (elemento => {
            if (elemento.componente == "configuracao-ultima"){

                this.atualizarConfiguracao(ultimaEvento.detail);    
            }
        });                                                       
    }






    criarEIniciarMenuDeAcoes(){

        let menuAcoes = this.noRaiz.querySelector("#menuAcoes");
        menuAcoes.innerHTML = "";

        this.querySelector("#reiniciarBanco").addEventListener("click", () => {
            UltimaDBWriter.getInstance().reiniciarBase().then(() => {
                //TODO: está recarregando tudo
                document.location.reload(true);
            });                
        });

        Promise.all(this.views[0].acoes.map(idAcao => UltimaDBReader.getInstance().acao(idAcao)))
            .then (acoes => {
                acoes.forEach (acao => {
                    let a = document.createElement("a");
                    a.href = "#";
                    a.textContent = acao.nome;
                    menuAcoes.appendChild(a);

                    a.addEventListener("click", e => {
                        this.adicionarElemento(acao.nome, acao.componente, acao.dados)
                    });
                });
            });        
    }



    mediaImportancia(elementos){
        const soma = elementos.reduce((valorAnterior, elementoAtual) => valorAnterior + elementoAtual.importancia, 0);
        const media = (soma / elementos.length) || 0;
        return media;
    }



    proximoIdElemento(elementos){
        let id = 0;
        elementos.forEach(elemento => {
            if (elemento.id > id){
                id = elemento.id;
            }
        });
        return ++id;
    }



    proximaOrdem(elementos){
        let ordem = 0;
        elementos.forEach(elemento => {
            if (elemento.ordem > ordem){
                ordem = elemento.ordem;
            }
        });
        ++ordem;        

        return ordem;
    }



    adicionarElemento(nome_elemento, nome_componente, dados){

        let id_novo_elemento = this.proximoIdElemento(this.views[0].elementos);

        let novo_elemento = {                        
            "id": id_novo_elemento,
            "nome": nome_elemento,            
            "dados": dados
        };
        let novo_elemento_view = {
            "id": id_novo_elemento,
            "id_elemento": id_novo_elemento,
            "ordem": this.proximaOrdem(this.views[0].elementos),            
            "importancia": this.mediaImportancia(this.views[0].elementos),
            "componente": nome_componente
        };

        this.views[0].elementos.push(novo_elemento_view);

        UltimaDBWriter.getInstance().atualizarElemento(novo_elemento).then( retorno => {
            UltimaDBWriter.getInstance().atualizarView(this.views[0]).then( retorno => {
                this.controleNavegador.adicionarElemento(novo_elemento_view);
            });
        })             
    }



    configuracao(){

        let configuracaoUltima = this.views[0].elementos.find (e => e.componente.nome == "configuracao-ultima");

        if (configuracaoUltima){
            alert ("Já está aberta a configuração!");
        }else{            
            this.adicionarElemento ("Configuração Última","configuracao-ultima",
                {
                    componentes: JSON.parse(JSON.stringify(this.componentes)),
                    elementos: JSON.parse(JSON.stringify(this.elementos)),
                    acoes: JSON.parse(JSON.stringify(this.acoes)),
                    views: JSON.parse(JSON.stringify(this.views)),
                } 
            );   
        }
    }



    carregarConfiguracao(configuracao){

        UltimaDBReader.getInstance().views().then (views => {

            //Caso não existam views na base [1ª Vez]
            if (views.length == 0){

                this.componentes = configuracao.componentes;                        
                this.elementos = configuracao.elementos;
                this.acoes = configuracao.acoes;
                this.views = configuracao.views;

                console.log ("carregando configuracao do arquivo");

                Promise.all([
                    UltimaDBWriter.getInstance().atualizarElementos(this.elementos),
                    UltimaDBWriter.getInstance().atualizarComponentes(this.componentes),
                    UltimaDBWriter.getInstance().atualizarAcoes(this.acoes),
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



    atualizarConfiguracao(elementoConfiguracao){
        
        elementoConfiguracao.dados.view.elementos.forEach(elemento_configuracao => {

            let elemento_atualizado = JSON.parse(JSON.stringify(elemento_configuracao));

            //Encontra o índice do elemento da configuração aqui no array de elementos da view
            let indice = this.view.elementos.map(e => e.id).indexOf (elemento_atualizado.id);                                    

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
customElements.define('ultima-view', UltimaView);