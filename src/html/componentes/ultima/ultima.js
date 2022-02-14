import { BaseTestesTreeMap } from "./base_teste.js";

export class UltimaEvento extends CustomEvent{

    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO'; 
    static EVENTO_ATUALIZACAO_OBJETO = 'EVENTO_ATUALIZACAO_OBJETO'; 

    constructor(evento, objetoDeDados){
        super(evento, {'detail':{'objeto':objetoDeDados}, 'bubbles': true, 'composed':true});
    }
}



export class UltimaDAO extends EventTarget{


    static EVENTO_BANCO_CARREGADO = "EVENTO_BANCO_CARREGADO";

    static instancia = undefined;
    static NOME_BANCO = "UltimaDB";
    static VERSAO = 1;


    static getInstance(){

        if (!UltimaDAO.instancia){
            UltimaDAO.instancia = new UltimaDAO();
        }
        return UltimaDAO.instancia;
    }



    constructor(){
        super();

        if (!window.indexedDB) {
            window.alert("Seu navegador não suporta uma versão estável do IndexedDB. Alguns recursos não estarão disponíveis.");
        }

        this.banco = undefined;
        this.abrirBanco();
    }


    aguardarBanco(){
        return new Promise ((resolve, reject) => {
            if (this.banco){
                resolve (true);
            }else{
                this.addEventListener(UltimaDAO.EVENTO_BANCO_CARREGADO, ()=>{                    
                    resolve(true);
                });
            }
        });
    }


    async telas(){
        
        await this.aguardarBanco();

        let object_store_telas = this.banco.transaction ("telas", "readonly").objectStore ("telas");

        let telas = [];
        
        return new Promise((resolve, reject) => {
            object_store_telas.openCursor().onsuccess = evento => {
                let cursor = evento.target.result;
                if (cursor){
                    telas.push (cursor.value);
                    cursor.continue();
                }else{
                    resolve(telas);
                }
            };    
        });    
    }


    async atualizarTela (tela){
       
        await this.aguardarBanco();

        let object_store_telas = this.banco.transaction ("telas", "readwrite").objectStore ("telas");

        tela.elementos.sort ((a, b) => a.ordem - b.ordem);        
        
        return new Promise((resolve, reject) => {
            let request = object_store_telas.put(tela);
            request.onsuccess = evento => {
                resolve(true);
            };    
            request.onerror = evento => {
                reject("");
            };
        });    
     }


    telaAtual(){
        //Recuperar a tela atual do banco
    }




    removerTela(tela){
        //Remove a tela do banco        
    }



    abrirBanco(){

        let request = window.indexedDB.open(UltimaDAO.NOME_BANCO, UltimaDAO.VERSAO);


        request.onerror = evento => {
            console.error(`Erro ao abrir banco: ${UltimaDAO.NOME_BANCO} (versão: ${UltimaDAO.VERSAO}): ${evento.target.errorCode}`);
            return;
        };


        request.onsuccess = evento => {

            console.info(`Banco aberto: ${UltimaDAO.NOME_BANCO} (versão: ${UltimaDAO.VERSAO})`);
            this.banco = request.result;

            this.banco.onerror = evento => {                
                console.error(`Erro no banco: ${UltimaDAO.NOME_BANCO} (versão: ${UltimaDAO.VERSAO}): ${evento.target.errorCode}`);
            };
            this.bancoCarregado();
            return;
        };


        // Este evento é implementado somente em navegadores mais recentes
        request.onupgradeneeded = evento => {

            console.info (`Função de upgrade do banco: ${UltimaDAO.NOME_BANCO} (versão: ${UltimaDAO.VERSAO})`);
            this.banco = request.result;                        

            let object_store_telas = this.banco.createObjectStore("telas", { keyPath: "id", autoIncrement: true });

            object_store_telas.createIndex("index_nome", "nome", { unique: false});

            object_store_telas.transaction.oncomplete = evento => {

                object_store_telas = this.banco.transaction ("telas", "readwrite").objectStore ("telas");
                object_store_telas.add (BaseTestesTreeMap.base.telas[0]);
                object_store_telas.transaction.oncomplete = evento => {
                    console.info (`Dados do banco foram inicializados: ${UltimaDAO.NOME_BANCO} (versão: ${UltimaDAO.VERSAO})`);
                }
                this.bancoCarregado();
                return;
            };            
        };
    }

    adi

    bancoCarregado(){
        this.dispatchEvent (new Event(UltimaDAO.EVENTO_BANCO_CARREGADO));
    }
}