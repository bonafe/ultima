import { ComponenteBase } from "../componente_base.js";
import { UltimaEvento } from "./ultima_evento.js";
import { UltimaDAO } from "./ultima_dao.js";
import { ContainerTreeMap } from "../container_treemap/container_treemap.js";

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

            UltimaDAO.getInstance().views().then (views => {
                
                this.views  = views;

                this.criarEIniciarControleNavegadorTreemap();

                this.criarEIniciarMenuDeAcoes();
                    
                this.adicionarComportamentoSelecaoObjetos();

                this.adicionarComportamentoAtualizacaoElemento();
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
    }



  



    adicionarComportamentoAtualizacaoElemento(){
        this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_ELEMENTO, evento => {
            UltimaDAO.getInstance().elemento_view(evento.detail.id_view,evento.detail.id).then (elemento => {
                if (elemento.componente == "configuracao-ultima"){

                    this.atualizarConfiguracao(evento.detail);    
                }
            });                                                       
        });
    }



    adicionarComportamentoSelecaoObjetos(){
        //TODO: Está abrindo sempre o mesmo componente que a origem
        this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_SELECAO_OBJETO, evento => {                        

            this.adicionarElemento (
                //Componente
                evento.detail.elemento_origem.componente,
                //Dados
                evento.detail.dados
            );                                                                   
        });
    }



    criarEIniciarMenuDeAcoes(){

        let menuAcoes = this.noRaiz.querySelector("#menuAcoes");
        menuAcoes.innerHTML = "";

        this.querySelector("#reiniciarBanco").addEventListener("click", () => {
            UltimaDAO.getInstance().reiniciarBase().then(() => {
                //TODO: está recarregando tudo
                document.location.reload(true);
            });                
        });

        Promise.all(this.views[0].acoes.map(idAcao => UltimaDAO.getInstance().acao(idAcao)))
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

        UltimaDAO.getInstance().atualizarElemento(novo_elemento).then( retorno => {
            UltimaDAO.getInstance().atualizarView(this.views[0]).then( retorno => {
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

        UltimaDAO.getInstance().views().then (views => {

            //Caso não existam views na base [1ª Vez]
            if (views.length == 0){

                this.componentes = configuracao.componentes;                        
                this.elementos = configuracao.elementos;
                this.acoes = configuracao.acoes;
                this.views = configuracao.views;

                console.log ("carregando configuracao do arquivo");

                Promise.all([
                    UltimaDAO.getInstance().atualizarElementos(this.elementos),
                    UltimaDAO.getInstance().atualizarComponentes(this.componentes),
                    UltimaDAO.getInstance().atualizarAcoes(this.acoes),
                    UltimaDAO.getInstance().atualizarView(this.views[0])
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
        UltimaDAO.getInstance().atualizarView(this.view);
    }
}
customElements.define('ultima-view', UltimaView);