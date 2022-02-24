import { BaseInicialUltima } from "./base_inicial_ultima.js";




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
        this.atualizarTela(BaseInicialUltima.base.telas[0]);       
    }

    

    async componentes(){        
        return this.lerTodosElementos("componentes");
    }


    async telas(){        
        return this.lerTodosElementos("telas");
    }



    async atualizarTela (tela){      
        return this.atualizarRegistro (tela, "telas");    
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
            osTelas.add (BaseInicialUltima.base.telas[0]);
            
            let osComponentes = transacao.objectStore ("componentes");      
            BaseInicialUltima.base.componentes.forEach (componente => {
                console.log (`adicionando componente: ${componente.nome}`);
                osComponentes.add (componente);
            });

            transacao.oncomplete = evento => {
                console.info ("Elementos adicionados com sucesso");
                resolve(true);
            }      
        });
    }



    bancoCarregado(){
        this.carregado = true;
        this.dispatchEvent (new Event(UltimaDAO.EVENTO_BANCO_CARREGADO));
    }



    async lerTodosElementos (objectStore){        

        await this.aguardarBanco();

        let object_store = this.banco.transaction (objectStore, "readonly").objectStore (objectStore);

        let registros = [];
        
        return new Promise((resolve, reject) => {
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
}