import { ComponentesPadraoUltima } from "../componentes_padrao_ultima.js";
import { DBBase } from '../../db/db_base.js';



export class UltimaDB extends DBBase{

    static instancia = undefined;
    static NOME_BANCO = "UltimaDB";
    static VERSAO = 4;



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
            console.info ("VERSÃO 3 - Apaga tudo e recria");
            
            //Apaga todas as ObjectStore do banco
            Array.from(dbBase.banco.objectStoreNames).forEach (objectStore => dbBase.banco.deleteObjectStore(objectStore));

            let object_store_componentes = dbBase.banco.createObjectStore("componentes", { keyPath: "id", autoIncrement: true });
            object_store_componentes.createIndex("index_nome_componente", "nome", { unique: false});

            let object_store_elementos = dbBase.banco.createObjectStore("elementos", { keyPath: "id", autoIncrement: true });                            

            let object_store_views = dbBase.banco.createObjectStore("views", { keyPath: "id", autoIncrement: true });                    
            object_store_views.createIndex("index_descricao_views", "descricao", { unique: false});
        },
        dbBase => {
            console.info ("VERSÃO 4 - Object Store de Ações");
            
            let object_store_componentes = dbBase.banco.createObjectStore("acoes", { keyPath: "id", autoIncrement: true });
            object_store_componentes.createIndex("index_nome_acao", "nome", { unique: false});
            object_store_componentes.createIndex("index_componente_acao", "componente", { unique: false});                
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

        this.atualizarComponentesPadrao().then(() =>{

            this.dispatchEvent (new Event(DBBase.EVENTO_BANCO_CARREGADO));
        });
    }



    atualizarComponentesPadrao(){
        return new Promise((resolve, reject) => {
            let transacao = this.banco.transaction (["views","componentes"], "readwrite")

            let osComponentes = transacao.objectStore ("componentes");   

            ComponentesPadraoUltima.base.componentes.forEach (componente => {
                console.log (`adicionando componente: ${componente.nome}`);
                osComponentes.put (componente);
            });

            transacao.oncomplete = evento => {
                console.info ("Elementos adicionados com sucesso");
                resolve(true);
            }
        });
    }
}