import { ComponenteBase } from "../componente_base.js";
import { UltimaEvento } from "./ultima_evento.js";
import { UltimaDBWriter } from "./db/ultima_db_writer.js";
import { UltimaDBReader } from "./db/ultima_db_reader.js";
import { UltimaTreemapView } from "./view/treemap/ultima_treemap_view.js";



export class UltimaJS extends ComponenteBase{    



    constructor(){        
        super({templateURL:"/componentes/ultima/ultima_js.html", shadowDOM:false});
        
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



    carregarConfiguracao(configuracao){

        UltimaDBReader.getInstance().views().then (views => {

            //Caso não existam views na base [1ª Vez]
            if (views.length == 0){

                this.views = configuracao.views;

                console.log ("carregando configuracao do arquivo");

                Promise.all([
                    UltimaDBWriter.getInstance().atualizarElementos(configuracao.elementos),
                    UltimaDBWriter.getInstance().atualizarComponentes(configuracao.componentes),
                    UltimaDBWriter.getInstance().atualizarAcoes(configuracao.acoes),
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



    
    criarEIniciarControleNavegadorTreemap(){
        this.controleNavegador = this.noRaiz.querySelector("ultima-treemap-view");
            
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
            {evento:UltimaEvento.EVENTO_EXECUTAR_ACAO, funcao:this.executarAcao.bind(this)},
            {evento:UltimaEvento.EVENTO_SELECAO_OBJETO, funcao:this.selecionouObjeto.bind(this)},
            {evento:UltimaEvento.EVENTO_ADICIONAR_ELEMENTO, funcao:this.adicionarElemento.bind(this)},
            {evento:UltimaEvento.EVENTO_ATUALIZACAO_ELEMENTO, funcao:this.atualizacaoElemento.bind(this)}
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
        this.adicionarElemento ({
            nome_elemento:"Adicionado",
            nome_componente:"exibidor-iframe",
            dados:{src:"https://www.youtube.com/embed/YkgkThdzX-8"}
        });
    }



    selecionouObjeto(ultimaEvento){        
        this.adicionarElemento ({
            nome_elemento:"Novo a partir de seleção",
            nome_componente:ultimaEvento.detail.elemento_origem.componente,
            dados:ultimaEvento.detail.dados
        });
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






   











    adicionarElemento(detalhe){

        let id_novo_elemento = this.proximoIdElemento(this.views[0].elementos);

        let novo_elemento = {                        
            "id": id_novo_elemento,
            "nome": detalhe.nome_elemento,            
            "dados": detalhe.dados
        };
        let novo_elemento_view = {
            "id": id_novo_elemento,
            "id_elemento": id_novo_elemento,
            "ordem": this.proximaOrdem(this.views[0].elementos),            
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
customElements.define('ultima-js', UltimaJS);