import { BaseTestesTreeMap } from "./base_teste.js";




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
        this.carregado = false;
        this.atualizandoBanco = false;
        this.abrirBanco();
    }



    aguardarBanco(){
        return new Promise ((resolve, reject) => {
            if (this.carregado){
                resolve (true);
            }else{
                this.addEventListener(UltimaDAO.EVENTO_BANCO_CARREGADO, ()=>{                    
                    resolve(true);
                });
            }
        });
    }


    async reiniciarBase(){
        this.atualizarTela(BaseTestesTreeMap.base.telas[0]);
    }


    async telas(){
        
        //return  BaseTestesTreeMap.base.telas;

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
       
        //TODO: por algum motivo o número de elementos da variável tela estava mudando
        //Tive que jogar o conteudo copiando por transformação json para conseguir fazer funcionar
        //Acontecia quando usava o mover do treemap ou o aumentar/diminuir e ai adicionava um novo elemento
        //Depois do aguardarBanco() o conteúdo mudava        
        let nt = JSON.parse(JSON.stringify(tela));        


        //TODO: PQ MUDA O NÚMERO DE ELEMENTOS DE TELA???
        //console.log (`TODO: antes do aguardarbanco ${tela.elementos.length} elementos`);
        //console.log (`TODO: antes do aguardarbanco COPIA ${nt.elementos.length} elementos`);

        await this.aguardarBanco();

        //TODO: PQ MUDA O NÚMERO DE ELEMENTOS DE TELA???
        //console.log (`TODO: depois do aguardarbanco ${tela.elementos.length} elementos`);
        //console.log (`TODO: depois do aguardarbanco COPIA ${nt.elementos.length} elementos`);



        let object_store_telas = this.banco.transaction ("telas", "readwrite").objectStore ("telas");
        
        nt.elementos.sort ((a, b) => a.ordem - b.ordem);                
        
        return new Promise((resolve, reject) => {            
            let request = object_store_telas.put(nt);
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



    async abrirBanco(){

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

            if (!this.atualizandoBanco){
                this.bancoCarregado();
            }else{
                this.adicionarElementos().then ( retorno => {
                    console.info (`Dados do banco foram inicializados: ${UltimaDAO.NOME_BANCO} (versão: ${UltimaDAO.VERSAO})`);
                    this.atualizandoBanco = false;
                    this.bancoCarregado();
                });
            }
            return;
        };


        
        request.onupgradeneeded = evento => {

            this.atualizandoBanco = true;

            console.info (`Função de upgrade do banco: ${UltimaDAO.NOME_BANCO} (versão: ${UltimaDAO.VERSAO})`);
            this.banco = request.result;                        

            this.criarTabelas();                        
        };
    }


    criarTabelas(){      

        console.info ("Criando ObjectStores");
        
        let object_store_telas = this.banco.createObjectStore("telas", { keyPath: "id", autoIncrement: true });                    
        object_store_telas.createIndex("index_descricao_tela", "descricao", { unique: false});    

        let object_store_componentes = this.banco.createObjectStore("componentes", { keyPath: "id", autoIncrement: true });
        object_store_componentes.createIndex("index_nome_componente", "nome", { unique: false});
    }

    adicionarElementos(){
        return new Promise((resolve, reject) => {
            let transacao = this.banco.transaction (["telas","componentes"], "readwrite")

            let osTelas = transacao.objectStore ("telas");            
            osTelas.add (BaseTestesTreeMap.base.telas[0]);
            
            let osComponentes = transacao.objectStore ("componentes");      
            BaseTestesTreeMap.base.componentes.forEach (componente => {
                osComponentes.add (componente);
            });

            transacao.oncomplete = evento => {
                console.info ("Elementos adicionados com sucesso");
                resolve(true);
            }      
        });
    }




    criarObjectStoreTelas(){

        return new Promise((resolve, reject) => {
            console.info ("Criando ObjectStore de Telas");
            let object_store_telas = this.banco.createObjectStore("telas", { keyPath: "id", autoIncrement: true });

            object_store_telas.createIndex("index_descricao_tela", "descricao", { unique: false});
    
            object_store_telas.transaction.oncomplete = evento => {
    
                console.info ("ObjectStore Telas criada com sucesso. Adicionando telas...");
                let transacao_telas = this.banco.transaction ("telas", "readwrite").objectStore ("telas");
                transacao_telas.add (BaseTestesTreeMap.base.telas[0]);

                transacao_telas.transaction.oncomplete = evento => {
                    console.info ("Telas adicionadas com sucesso");
                    resolve(true);
                }                                
            };   

            object_store_telas.transaction.onerror = evento => {
                console.error(`Erro ao adicionar telas: ${UltimaDAO.NOME_BANCO} (versão: ${UltimaDAO.VERSAO}): ${evento.target.errorCode}`);
                reject("");
            };

            object_store_telas.transaction.onabort = evento => {
                console.error(`Transação com telas abortada: ${UltimaDAO.NOME_BANCO} (versão: ${UltimaDAO.VERSAO}): ${evento.target.errorCode}`);
                reject("");
            };
        });   
    }



    criarObjectStoreComponentes(){

        return new Promise((resolve, reject) => {
            console.info ("Criando ObjectStore de Componentes");
            let object_store_componentes = this.banco.createObjectStore("componentes", { keyPath: "id", autoIncrement: true });

            object_store_componentes.createIndex("index_nome_componente", "nome", { unique: false});
    
            object_store_componentes.transaction.oncomplete = evento => {
    
                console.info ("ObjectStore Componentes criada com sucesso. Adicionando componentes...");

                let transacao_componentes = this.banco.transaction ("componentes", "readwrite").objectStore ("componentes");
                
                BaseTestesTreeMap.base.componentes.forEach (componente => {
                    transacao_componentes.add (componente);
                });

                transacao_componentes.transaction.oncomplete = evento => {
                    console.info ("Componentes adicionados com sucesso");
                    resolve(true);
                }       
                
                transacao_componentes.transaction.onerror = evento => {
                    console.error(`Erro ao adicionar componentes: ${UltimaDAO.NOME_BANCO} (versão: ${UltimaDAO.VERSAO}): ${evento.target.errorCode}`);
                    reject("");
                };
            };   
        });   
    }



    bancoCarregado(){
        this.carregado = true;
        this.dispatchEvent (new Event(UltimaDAO.EVENTO_BANCO_CARREGADO));
    }
}