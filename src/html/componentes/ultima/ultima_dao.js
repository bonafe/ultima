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

        await this.aguardarBanco();

        return new Promise ((resolve, reject) => {

            this.limparObjectStore("elementos")
                .then(() => this.limparObjectStore("componentes"))
                    .then(() => this.limparObjectStore("views"))
                        .then(() => this.adicionarComponentesIniciais())
                            .then(()=> resolve(true));
        
        });      
    }

    

    async componentes(){        
        return this.lerTodosRegistros("componentes");
    }
    async componente(chave){        
        return this.trazerRegistro(chave, "componentes", "index_nome_componente");
    }


    async elementos(){        
        return this.lerTodosRegistros("elementos");
    }
    async elemento(chave){        
        return this.trazerRegistro(chave, "elementos");
    }


    async views(){        
        return this.lerTodosRegistros("views");
    }
    async elemento_view(chave, chave_elemento){        
        return this.trazerRegistro(chave, "views").then(view => view.elementos.find(e => e.id == chave_elemento));
    }

    
    async atualizarComponentes (componentes){
        return new Promise((resolve, reject) => {
            this.limparObjectStore("componentes").then(()=>{
                Promise.all(componentes.map (componente => this.atualizarComponente(componente))).then(retornos => {
                    resolve(true);
                })
            })
        });
    }

    async atualizarElementos (elementos){
        return new Promise((resolve, reject) => {
            this.limparObjectStore("elementos").then(()=>{
                Promise.all(elementos.map (elemento => this.atualizarElemento(elemento))).then(retornos => {
                    resolve(true);
                })
            })
        });
    }


    async atualizarComponente (componente){      
        return this.atualizarRegistro (componente, "componentes");    
    }


    async atualizarElemento (elemento){      
        return this.atualizarRegistro (elemento, "elementos");    
    }


    async atualizarView (view){      
        return this.atualizarRegistro (view, "views");    
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

                //Rodou a função de upgrade, ainda estamos em processo de inicialização do banco
                //Adiciona os componentes iniciais para funcionamento mínimo do sistema Ultima
                this.adicionarComponentesIniciais().then ( retorno => {
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
        
        let object_store_views = this.banco.createObjectStore("views", { keyPath: "id", autoIncrement: true });                    
        object_store_views.createIndex("index_descricao_views", "descricao", { unique: false});    

        let object_store_elementos = this.banco.createObjectStore("elementos", { keyPath: "id", autoIncrement: true });                            

        let object_store_componentes = this.banco.createObjectStore("componentes", { keyPath: "id", autoIncrement: true });
        object_store_componentes.createIndex("index_nome_componente", "nome", { unique: false});
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
        this.dispatchEvent (new Event(UltimaDAO.EVENTO_BANCO_CARREGADO));
    }



    async lerTodosRegistros (objectStore){        

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