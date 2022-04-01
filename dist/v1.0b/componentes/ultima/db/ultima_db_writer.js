import { UltimaDB } from "./ultima_db.js";



export class UltimaDBWriter extends UltimaDB{


    static getInstance(){

        if (!UltimaDBWriter.instancia){
            UltimaDBWriter.instancia = new UltimaDBWriter();
        }
        return UltimaDBWriter.instancia;
    }



    constructor(){
        super();

        if (!window.indexedDB) {
            window.alert("Seu navegador não suporta uma versão estável do IndexedDB. Alguns recursos não estarão disponíveis.");
        }
    }



    async reiniciarBase(){

        await this.aguardarBanco();

        return new Promise ((resolve, reject) => {

            this.limparObjectStore("elementos")
                .then(() => this.limparObjectStore("componentes"))
                    .then(() => this.limparObjectStore("views"))
                        .then(() => this.limparObjectStore("acoes"))
                            .then(() => this.limparObjectStore("controladores"))
                                .then(() => this.atualizarConfiguracoesPadrao())
                                    .then(()=> resolve(true));
        
        });      
    }

    
    
    async atualizarComponentes (componentes){
        return new Promise((resolve, reject) => {            
            Promise.all(componentes.map (componente => this.atualizarComponente(componente))).then(retornos => {
                resolve(true);
            });            
        });
    }

    async atualizarElementos (elementos){
        return new Promise((resolve, reject) => {            
            Promise.all(elementos.map (elemento => this.atualizarElemento(elemento))).then(retornos => {
                resolve(true);
            });            
        });
    }

    async atualizarAcoes (acoes){
        return new Promise((resolve, reject) => {            
            Promise.all(acoes.map (acao => this.atualizarAcao(acao))).then(retornos => {
                resolve(true);                
            })
        });
    }
    async atualizarControladores (controladores){
        return new Promise((resolve, reject) => {            
            Promise.all(controladores.map (controlador => this.atualizarControlador(controlador))).then(retornos => {
                resolve(true);                
            })
        });
    }
    async atualizarControlador (controlador){      
        return this.atualizarRegistro (controlador, "controladores");    
    }

    async atualizarComponente (componente){      
        return this.atualizarRegistro (componente, "componentes");    
    }


    async atualizarElemento (elemento){      
        return this.atualizarRegistro (elemento, "elementos");    
    }

    async atualizarAcao (acao){      
        return this.atualizarRegistro (acao, "acoes");    
    }

    async atualizarView (view){      
        return this.atualizarRegistro (view, "views");    
    }
}