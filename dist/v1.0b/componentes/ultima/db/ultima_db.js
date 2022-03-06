import { BaseInicialUltima } from "../base_inicial_ultima.js";




export class UltimaDB extends EventTarget{



    static EVENTO_BANCO_CARREGADO = "EVENTO_BANCO_CARREGADO";

    static instancia = undefined;
    static NOME_BANCO = "UltimaDB";
    static VERSAO = 4;



    static getInstance(){

        if (!UltimaDB.instancia){
            UltimaDB.instancia = new UltimaDB();
        }
        return UltimaDB.instancia;
    }



    constructor(){
        super();

        if (!window.indexedDB) {
            window.alert("Seu navegador não suporta uma versão estável do IndexedDB. Alguns recursos não estarão disponíveis.");
        }

        this.banco = undefined;
        this.carregado = false;
        this.atualizandoBanco = false;
        this.abrirBanco();
    }



    aguardarBanco(){
        return new Promise ((resolve, reject) => {
            if (this.carregado){
                resolve (true);
            }else{
                this.addEventListener(UltimaDB.EVENTO_BANCO_CARREGADO, ()=>{                    
                    resolve(true);
                });
            }
        });
    }



    async abrirBanco(){

        let request = window.indexedDB.open(UltimaDB.NOME_BANCO, UltimaDB.VERSAO);


        request.onerror = evento => {
            console.error(`Erro ao abrir banco: ${UltimaDB.NOME_BANCO} (versão: ${UltimaDB.VERSAO}): ${evento.target.errorCode}`);
            return;
        };


        request.onsuccess = evento => {

            console.info(`Banco aberto: ${UltimaDB.NOME_BANCO} (versão: ${UltimaDB.VERSAO})`);
            this.banco = request.result;

            this.banco.onerror = evento => {                
                console.error(`Erro no banco: ${UltimaDB.NOME_BANCO} (versão: ${UltimaDB.VERSAO}): ${evento.target.errorCode}`);
            };

            if (!this.atualizandoBanco){
                this.bancoCarregado();
            }else{

                //Rodou a função de upgrade, ainda estamos em processo de inicialização do banco
                //Adiciona os componentes iniciais para funcionamento mínimo do sistema Ultima
                this.adicionarComponentesIniciais().then ( retorno => {
                    console.info (`Dados do banco foram inicializados: ${UltimaDB.NOME_BANCO} (versão: ${UltimaDB.VERSAO})`);
                    this.atualizandoBanco = false;
                    this.bancoCarregado();
                });
            }
            return;
        };


        
        request.onupgradeneeded = evento => {

            this.atualizandoBanco = true;

            console.info (`Função de upgrade do banco: ${UltimaDB.NOME_BANCO} (versão: ${UltimaDB.VERSAO})`);
            this.banco = request.result;                        

            this.atualizacaoVersao(evento.oldVersion);                        
        };
    }



    atualizacaoVersao(versaoAnterior){      

        [
            () => {
                console.info ("VERSÃO 1 - sem ação");                
            },
            () => {
                console.info ("VERSÃO 2 - sem ação");                
            },
            () => {
                console.info ("VERSÃO 3 - Apaga tudo e recria");
                
                //Apaga todas as ObjectStore do banco
                Array.from(this.banco.objectStoreNames).forEach (objectStore => this.banco.deleteObjectStore(objectStore));

                let object_store_componentes = this.banco.createObjectStore("componentes", { keyPath: "id", autoIncrement: true });
                object_store_componentes.createIndex("index_nome_componente", "nome", { unique: false});

                let object_store_elementos = this.banco.createObjectStore("elementos", { keyPath: "id", autoIncrement: true });                            

                let object_store_views = this.banco.createObjectStore("views", { keyPath: "id", autoIncrement: true });                    
                object_store_views.createIndex("index_descricao_views", "descricao", { unique: false});
            },
            () => {
                console.info ("VERSÃO 4 - Object Store de Ações");
                
                let object_store_componentes = this.banco.createObjectStore("acoes", { keyPath: "id", autoIncrement: true });
                object_store_componentes.createIndex("index_nome_acao", "nome", { unique: false});
                object_store_componentes.createIndex("index_componente_acao", "componente", { unique: false});                
            }

        ].forEach((funcaoDeUpgradeVersao, versao) => {
            versao++;

            if (versao > versaoAnterior){

                funcaoDeUpgradeVersao();
            }
        });
    }



    adicionarComponentesIniciais(){
        return new Promise((resolve, reject) => {
            let transacao = this.banco.transaction (["views","componentes"], "readwrite")
           
            let osComponentes = transacao.objectStore ("componentes");      
            BaseInicialUltima.base.componentes.forEach (componente => {
                console.log (`adicionando componente: ${componente.nome}`);
                osComponentes.put (componente);
            });

            transacao.oncomplete = evento => {
                console.info ("Elementos adicionados com sucesso");
                resolve(true);
            }      
        });
    }



    bancoCarregado(){
        this.carregado = true;
        this.dispatchEvent (new Event(UltimaDB.EVENTO_BANCO_CARREGADO));
    }



    async lerTodosRegistros (objectStore){        
            
        await this.aguardarBanco();

        return new Promise((resolve, reject) => {

            let object_store = this.banco.transaction (objectStore, "readonly").objectStore (objectStore);

            let registros = [];
                
            object_store.openCursor().onsuccess = evento => {
                let cursor = evento.target.result;
                if (cursor){
                    registros.push (cursor.value);
                    cursor.continue();
                }else{
                    resolve(registros);
                }
            };    
        });
    }

    
    async trazerRegistro (chave, objectStore, indice){
              
        await this.aguardarBanco();

        let object_store = this.banco.transaction (objectStore, "readonly").objectStore (objectStore);

        let elemento_requisicao = object_store;

        if (indice){
            elemento_requisicao = object_store.index(indice);
        }

        return new Promise((resolve, reject) => { 
            
            let request = elemento_requisicao.get(chave);
            request.onsuccess = evento => {                
                resolve(request.result);
            };    
            request.onerror = evento => {
                reject("");
            };
        });    
     }


    async atualizarRegistro (registro, objectStore){
      
        //Garante que o que será persistido é uma cópia
        let copia_registro = JSON.parse(JSON.stringify(registro));        

        await this.aguardarBanco();

        let object_store = this.banco.transaction (objectStore, "readwrite").objectStore (objectStore);
                
        return new Promise((resolve, reject) => {            
            let request = object_store.put(copia_registro);
            request.onsuccess = evento => {                
                resolve(true);
            };    
            request.onerror = evento => {
                reject("");
            };
        });    
     }

     async limparObjectStore(objectStore){
         
        await this.aguardarBanco();

        let object_store = this.banco.transaction (objectStore, "readwrite").objectStore (objectStore);
                
        return new Promise((resolve, reject) => {            
            let request = object_store.clear();
            request.onsuccess = evento => {                
                resolve(true);
            };    
            request.onerror = evento => {
                reject("");
            };
        });
     }
}