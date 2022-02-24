import { ComponenteBase } from "../componente_base.js";
import { UltimaEvento } from "./ultima_evento.js";
import { UltimaDAO } from "./ultima_dao.js";
import { ContainerTreeMap } from "../container_treemap/container_treemap.js";

export class UltimaView extends ComponenteBase{    



    constructor(){        
        super({templateURL:"/componentes/ultima/ultima_view.html", shadowDOM:false});
        
        this.addEventListener('carregou', () => {
            
            this.criarEIniciarControleNavegadorTreemap();

            this.adicionarComportamentoMenu();
            
            this.adicionarComportamentoSelecaoObjetos();

            this.adicionarComportamentoAtualizacaoDados();

            this.adicionarComportamentoAtualizacaoTreemap();            
        });
    }



    criarEIniciarControleNavegadorTreemap(){
        this.controleNavegador = this.noRaiz.querySelector("container-treemap");

            UltimaDAO.getInstance().componentes().then( componentes => {                
                this.controleNavegador.setAttribute("componentes", JSON.stringify(componentes));                                            
            });

            UltimaDAO.getInstance().telas().then (telas => {
                //TODO: só está pegando a primeira tela
                this.tela  = telas[0];
                this.controleNavegador.tela = JSON.parse(JSON.stringify(this.tela));
            });
    }



    adicionarComportamentoAtualizacaoTreemap(){
        this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_TREEMAP, evento => {
            
            this.tela = evento.detail.tela;

            //Remove o elemento de configuracao para salvar (senão ficaria recursiva a configuracao)
            let indice = this.tela.elementos.map(e => e.componentePadrao).indexOf ("configuracao-ultima");

            if (indice >= 0){
                this.tela.elementos.splice(indice,1);
            }


            UltimaDAO.getInstance().atualizarTela(this.tela);
        });
    }



    adicionarComportamentoAtualizacaoDados(){
        this.noRaiz.querySelector("container-treemap").addEventListener(UltimaEvento.EVENTO_ATUALIZACAO_DADOS, evento => {

            if (evento.detail.componente.padrao == "configuracao-ultima"){

                this.atualizarConfiguracao(evento.detail);

            }else{
                
                let id_elemento = evento.detail.id;
                let elemento = this.tela.elementos.find (elemento => elemento.id == id_elemento);
    
                elemento.dados = evento.detail.dados;
                elemento.componente = evento.detail.componente;
                elemento.descricao = evento.detail.descricao;          

                

                UltimaDAO.getInstance().atualizarTela(this.tela); 
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
            "id": this.proximoIdElemento(this.tela.elementos), 
            "ordem": this.proximaOrdem(this.tela.elementos),
            "descricao": `Componente: ${componentePadrao}`,
            "importancia": this.mediaImportancia(this.tela.elementos),
            "componente":{
                "padrao": componentePadrao,
                "compativeis": componentesCompativeis
            },
            "dados": dados
        };

        //Não persiste o elemento de configuração
        if (novoElemento.componente.padrao != "configuracao-ultima"){        

            this.tela.elementos.push(novoElemento);                                                      
            UltimaDAO.getInstance().atualizarTela(this.tela);
        }

        this.controleNavegador.adicionarElemento(novoElemento);
    }



    configuracao(){

        let configuracaoUltima = this.tela.elementos.find (e => e.componente.nome == "configuracao-ultima");

        if (configuracaoUltima){
            alert ("Já está aberta a configuração!");
        }else{
            this.adicionarElemento (["configuracao-ultima"],"configuracao-ultima",                
                {configuracao: JSON.parse(JSON.stringify(this.tela))} 
            );   
        }
    }


    atualizarConfiguracao(elementoConfiguracao){
        
        elementoConfiguracao.dados.configuracao.elementos.forEach(elemento_configuracao => {

            let elemento_atualizado = JSON.parse(JSON.stringify(elemento_configuracao));

            //Encontra o índice do elemento da configuração aqui no array de elementos da tela
            let indice = this.tela.elementos.map(e => e.id).indexOf (elemento_atualizado.id);                                    

            //Remove o elemento atual da tela da posição
            let [elemento_tela] = this.tela.elementos.splice(indice,1);

            //Coloca uma cópia atualizada em seu lugar
            
            this.tela.elementos.splice(indice,0,elemento_atualizado);

            this.controleNavegador.atualizarElemento(elemento_atualizado);
        });

        //Persiste a tela atualizada
        UltimaDAO.getInstance().atualizarTela(this.tela);
    }
}
customElements.define('ultima-view', UltimaView);