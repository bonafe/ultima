


import { DBBase } from '../../db/db_base.js';

import { ConfiguracoesPadrao } from './configuracoes_padrao.js';



export class GrafoDB extends DBBase{



    static instancia = undefined;

    static NOME_BANCO = "GrafoDB";

    static VERSAO = 1;




    static getInstance(){

        if (!GrafoDB.instancia){
            GrafoDB.instancia = new GrafoDB();
        }
        return GrafoDB.instancia;
    }




    static funcoesDeUpgradeVersao = [          
        (db_base) => {
            console.info ("VERSÃO 1 - Cria banco");
            
            //Apaga todas as ObjectStore do banco
            Array.from(db_base.banco.objectStoreNames).forEach (objectStore => db_base.banco.deleteObjectStore(objectStore));

            let object_store_grafos = db_base.banco.createObjectStore("grafos", { keyPath: ["uuid"] });            
            object_store_grafos.createIndex("index_nome_grafo", "nome", { unique: false});
            object_store_grafos.createIndex("index_descricao_descricao", "descricao", { unique: false});


            let object_store_elementos = db_base.banco.createObjectStore("configuracoes", { keyPath: "uuid" });                            
            object_store_elementos.createIndex("index_nome_configuracao", "nome", { unique: false});
            object_store_elementos.createIndex("index_descricao_configuracao", "descricao", { unique: false});

            GrafoDB.criarBases();            
        }
    ];




    static criarBases(){

        
    }




    constructor(){
        super(GrafoDB.NOME_BANCO, GrafoDB.VERSAO, GrafoDB.funcoesDeUpgradeVersao);

        if (!GrafoDB.rotinaInicializacao){
            GrafoDB.rotinaInicializacao = true;
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

            let transacao = this.banco.transaction (["configuracoes"], "readwrite")


            let osConfiguracoes = transacao.objectStore ("configuracoes");   

            ConfiguracoesPadrao.base.configuracoes.forEach (configuracao => {
                console.log (`GrafoDB: adicionando configuracao: ${configuracao.nome}`);
                osConfiguracoes.put (configuracao);
            });


            transacao.oncomplete = evento => {
                console.info ("GrafoDB: configuracoes adicionadas com sucesso");
                resolve(true);
            }
        });
    }
}