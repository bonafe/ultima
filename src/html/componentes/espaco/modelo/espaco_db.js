



import { ConfiguracoesPadrao } from "../configuracao/configuracoes_padrao.js";

import { DBBase } from '../../db/db_base.js';




export class EspacoDB extends DBBase{





    static instancia = undefined;

    static NOME_BANCO = "EspacoDB";

    static VERSAO = 8;




    static getInstance(){

        if (!EspacoDB.instancia){
            EspacoDB.instancia = new EspacoDB();
        }
        return EspacoDB.instancia;
    }




    static funcoesDeUpgradeVersao = [
        () => {
            console.info ("VERSÃO 1 - sem ação");                
        },
        () => {
            console.info ("VERSÃO 2 - sem ação");                
        },
        DBBase => {
            console.info ("VERSÃO 3 - sem ação");
        },
        DBBase => {
            console.info ("VERSÃO 4 - sem ação");                        
        },
        DBBase => {
            console.info ("VERSÃO 5 - sem ação");                        
        },
        DBBase => {
            console.info ("VERSÃO 6 - sem ação");                        
        },        
        DBBase => {
            console.info ("VERSÃO 7 - Apaga tudo e recria");
            
            //Apaga todas as ObjectStore do banco
            Array.from(DBBase.banco.objectStoreNames).forEach (objectStore => DBBase.banco.deleteObjectStore(objectStore));

            let object_store_componentes = DBBase.banco.createObjectStore("componentes", { keyPath: ["url","nome"] });            
            object_store_componentes.createIndex("index_nome_componente", "nome", { unique: false});
            object_store_componentes.createIndex("index_descricao_componente", "descricao", { unique: false});


            let object_store_elementos = DBBase.banco.createObjectStore("elementos", { keyPath: "uuid" });                            
            object_store_elementos.createIndex("index_titulo_elemento", ["titulo"], { unique: false});
            object_store_elementos.createIndex("index_descricao_elemento", "descricao", { unique: false});


            let object_store_views = DBBase.banco.createObjectStore("visualizacoes", { keyPath: "uuid"});                    
            object_store_views.createIndex("index_descricao_view", "descricao", { unique: false});
            object_store_views.createIndex("index_titulo_view", "titulo", { unique: false});
            

            let object_store_acoes = DBBase.banco.createObjectStore("acoes", { keyPath: "uuid" });
            object_store_acoes.createIndex("index_nome_acao", "nome", { unique: false});
            object_store_acoes.createIndex("index_componente_acao", "componente", { unique: false});


            let object_store_controladores = DBBase.banco.createObjectStore("controladores", { keyPath: "url" });                
            object_store_controladores.createIndex("index_url_controlador", "url", { unique: true});

            EspacoDB.criarBases();            
        }
    ];




    static criarBases(){

        
    }




    constructor(){
        super(EspacoDB.NOME_BANCO, EspacoDB.VERSAO, EspacoDB.funcoesDeUpgradeVersao);

        if (!EspacoDB.rotinaInicializacao){
            EspacoDB.rotinaInicializacao = true;
            this.addEventListener(DBBase.EVENTO_BANCO_CARREGADO, this.bancoBaseCarregado);
        }            
    }



    bancoBaseCarregado(evento){

        evento.stopPropagation();
        this.removeEventListener(DBBase.EVENTO_BANCO_CARREGADO, this.bancoBaseCarregado);

        this.atualizarConfiguracoesPadrao().then(() =>{

            this.dispatchEvent (new Event(DBBase.EVENTO_BANCO_CARREGADO));
        });
    }



    atualizarConfiguracoesPadrao(){
        return new Promise((resolve, reject) => {

            let transacao = this.banco.transaction (["componentes", "controladores"], "readwrite")


            let osComponentes = transacao.objectStore ("componentes");   

            //TODO: precisa verificar se já existe e deixar a versão mais nova (talvez poder escolher a versão)
            //TODO: mesmo componente poderá ser adicionado mais de uma vez se estiver no arquivo JSON de configurações do usuário
            ConfiguracoesPadrao.base.componentes.forEach (componente => {
                console.log (`EspacoDB: adicionando componente: ${componente.nome}`);
                osComponentes.put (componente);
            });


            let osControladores = transacao.objectStore ("controladores");   

            //TODO: precisa verificar se já existe e deixar a versão mais nova (talvez poder escolher a versão)
            //TODO: mesmo controlador poderá ser adicionado mais de uma vez se estiver no arquivo JSON de configurações do usuário
            ConfiguracoesPadrao.base.controladores.forEach (controlador => {
                console.log (`EspacoDB: adicionando CONTROLADOR: ${controlador.url}-${controlador.nome_classe}`);
                osControladores.put (controlador);
            });


            transacao.oncomplete = evento => {
                console.info ("EspacoDB: elementos adicionados com sucesso");
                resolve(true);
            }
        });
    }
}