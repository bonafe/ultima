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

            this.criarEIniciarControleNavegadorTreemap();

            this.adicionarComportamentoMenu();
                
            this.adicionarComportamentoSelecaoObjetos();

            this.adicionarComportamentoAtualizacaoElemento();

            this.adicionarComportamentoAtualizacaoTreemap();
            
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

            UltimaDAO.getInstance().views().then (views => {

                //TODO: só está pegando a primeira view
                this.view  = views[0];
                this.controleNavegador.view = JSON.parse(JSON.stringify(this.view));
            });                          
    }



    adicionarComportamentoAtualizacaoTreemap(){
        this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_TREEMAP, evento => {
            
            this.view = evento.detail.view;

            //Remove o elemento de configuracao para salvar (senão ficaria recursiva a configuracao)
            let indice = this.view.elementos.map(e => e.componentePadrao).indexOf ("configuracao-ultima");

            if (indice >= 0){
                this.view.elementos.splice(indice,1);
            }


            UltimaDAO.getInstance().atualizarView(this.view);
        });
    }



    adicionarComportamentoAtualizacaoElemento(){
        this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_ELEMENTO, evento => {

            if (evento.detail.componente.padrao == "configuracao-ultima"){

                this.atualizarConfiguracao(evento.detail);

            }else{
                
                let id_elemento = evento.detail.id;
                let elemento = this.view.elementos.find (elemento => elemento.id == id_elemento);
    
                elemento.dados = evento.detail.dados;
                elemento.componente = evento.detail.componente;
                elemento.descricao = evento.detail.descricao;          

                

                UltimaDAO.getInstance().atualizarView(this.view); 
            }                               
        });

        this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_COMPONENTE, evento => {

            if (evento.detail.componente.padrao == "configuracao-ultima"){

                this.atualizarConfiguracao(evento.detail);

            }else{
                
                let id_elemento = evento.detail.id;
                let elemento = this.view.elementos.find (elemento => elemento.id == id_elemento);
    
                elemento.dados = evento.detail.dados;
                elemento.componente = evento.detail.componente;
                elemento.descricao = evento.detail.descricao;          
                

                UltimaDAO.getInstance().atualizarView(this.view); 
            }                               
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



    adicionarComportamentoMenu(){
        this.querySelector("#filmes").addEventListener("click", () => {
            this.adicionarIFrame("https://www.youtube.com/embed/VyHV0BRtdxo");                                                                   
        });

        this.querySelector("#saude").addEventListener("click", () => {
            this.adicionarIFrame("https://www.youtube.com/embed/RwBmiMb97HQ");                                                                   
        });
        
        this.querySelector("#agenda").addEventListener("click", () => {
            this.adicionarIFrame("https://calendar.google.com/calendar/embed?src=en.brazilian%23holiday%40group.v.calendar.google.com&ctz=America%2FSao_Paulo");                                                                   
        });              
                        
        this.querySelector("#musicas").addEventListener("click", () => {
            this.adicionarIFrame("https://www.youtube.com/embed/KWZGAExj-es");                                                                   
        }); 

        this.querySelector("#reiniciarBanco").addEventListener("click", () => {
            UltimaDAO.getInstance().reiniciarBase().then(() => {
                //TODO: está recarregando tudo
                document.location.reload(true);
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



    adicionarIFrame(src){
        this.adicionarElemento(["exibidor-iframe"],"exibidor-iframe", {"src":src});
    }



    adicionarElemento(componentesCompativeis, componentePadrao, dados){

        let novoElemento = {                        
            "id": this.proximoIdElemento(this.view.elementos), 
            "ordem": this.proximaOrdem(this.view.elementos),
            "descricao": `Componente: ${componentePadrao}`,
            "importancia": this.mediaImportancia(this.view.elementos),
            "componente":{
                "padrao": componentePadrao,
                "compativeis": componentesCompativeis
            },
            "dados": dados
        };

        //Não persiste o elemento de configuração
        if (novoElemento.componente.padrao != "configuracao-ultima"){        

            this.view.elementos.push(novoElemento);                                                      
            UltimaDAO.getInstance().atualizarView(this.view);
        }

        this.controleNavegador.adicionarElemento(novoElemento);
    }



    configuracao(){

        let configuracaoUltima = this.view.elementos.find (e => e.componente.nome == "configuracao-ultima");

        if (configuracaoUltima){
            alert ("Já está aberta a configuração!");
        }else{
            this.adicionarElemento (["configuracao-ultima"],"configuracao-ultima",                
                {
                    componentes: JSON.parse(JSON.stringify(this.componentes)),
                    view: JSON.parse(JSON.stringify(this.view))
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
                this.views = configuracao.views[0];

                Promise.all([
                    UltimaDAO.getInstance().atualizarElementos(this.elementos),
                    UltimaDAO.getInstance().atualizarComponentes(this.componentes),
                    UltimaDAO.getInstance().atualizarView(this.views)
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