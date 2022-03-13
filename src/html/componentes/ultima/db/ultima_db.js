import { ConfiguracoesPadraoUltima } from "../configuracoes_padrao_ultima.js";
import { DBBase } from '../../db/db_base.js';



export class UltimaDB extends DBBase{

    static instancia = undefined;
    static NOME_BANCO = "UltimaDB";
    static VERSAO = 8;



    static getInstance(){

        if (!UltimaDB.instancia){
            UltimaDB.instancia = new UltimaDB();
        }
        return UltimaDB.instancia;
    }



    static funcoesDeUpgradeVersao = [
        () => {
            console.info ("VERSÃO 1 - sem ação");                
        },
        () => {
            console.info ("VERSÃO 2 - sem ação");                
        },
        dbBase => {
            console.info ("VERSÃO 3 - sem ação");
            
            
        },
        dbBase => {
            console.info ("VERSÃO 4 - sem ação");                        
        },
        dbBase => {
            console.info ("VERSÃO 5 - sem ação");                        
        },
        dbBase => {
            console.info ("VERSÃO 6 - sem ação");                        
        },        
        dbBase => {
            console.info ("VERSÃO 7 - Apaga tudo e recria");
            
            //Apaga todas as ObjectStore do banco
            Array.from(dbBase.banco.objectStoreNames).forEach (objectStore => dbBase.banco.deleteObjectStore(objectStore));


            let object_store_componentes = dbBase.banco.createObjectStore("componentes", { keyPath: ["url","nome"] });            
            object_store_componentes.createIndex("index_nome_componente", "nome", { unique: false});
            object_store_componentes.createIndex("index_descricao_componente", "descricao", { unique: false});


            let object_store_elementos = dbBase.banco.createObjectStore("elementos", { keyPath: "uuid" });                            
            object_store_elementos.createIndex("index_titulo_elemento", ["titulo"], { unique: false});
            object_store_elementos.createIndex("index_descricao_elemento", "descricao", { unique: false});


            let object_store_views = dbBase.banco.createObjectStore("views", { keyPath: "uuid"});                    
            object_store_views.createIndex("index_descricao_view", "descricao", { unique: false});
            object_store_views.createIndex("index_titulo_view", "titulo", { unique: false});
             

            let object_store_acoes = dbBase.banco.createObjectStore("acoes", { keyPath: "uuid" });
            object_store_acoes.createIndex("index_nome_acao", "nome", { unique: false});
            object_store_acoes.createIndex("index_componente_acao", "componente", { unique: false});


            let object_store_controladores = dbBase.banco.createObjectStore("controladores", { keyPath: "url" });                
        }
    ];



    constructor(){
        super(UltimaDB.NOME_BANCO, UltimaDB.VERSAO, UltimaDB.funcoesDeUpgradeVersao);

        if (!UltimaDB.rotinaInicializacao){
            UltimaDB.rotinaInicializacao = true;
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

            ConfiguracoesPadraoUltima.base.componentes.forEach (componente => {
                console.log (`adicionando componente: ${componente.nome}`);
                osComponentes.put (componente);
            });

            let osControladores = transacao.objectStore ("controladores");   

            ConfiguracoesPadraoUltima.base.controladores.forEach (controlador => {
                console.log (`adicionando CONTROLADOR: ${controlador.url}-${controlador.nome_classe}`);
                osControladores.put (controlador);
            });

            transacao.oncomplete = evento => {
                console.info ("Elementos adicionados com sucesso");
                resolve(true);
            }
        });
    }
}