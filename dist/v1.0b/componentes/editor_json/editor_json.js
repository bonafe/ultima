import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';


export class EditorJSON extends ComponenteBase {

    constructor(){
        super({templateURL:"./editor_json.html", shadowDOM:true}, import.meta.url);

        this._dados = undefined;

        this.addEventListener("carregou", () => {

            //Importa dinamicamente a biblioteca JSONEditor
            import(`${super.prefixoEndereco}/bibliotecas/jsoneditor/jsoneditor.js`).then(modulo => {

                this.criarEditor();                               
            });
        });
    }



    get dados(){
        return this._dados;
    }



    set dados(novosDados){
        this._dados = novosDados;
    }



    static get observedAttributes() {
        return ['dados'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

    
        if (nomeAtributo.localeCompare("dados") == 0){
            this.dados = JSON.parse(novoValor);

            //Se possui o atributo "src" e é um arquivo json
            let efetuouDownload = false;
            if (this.dados.src){ 
                this.src = this.dados.src;
                if (this.src.toLowerCase().endsWith("json")){                    

                    //Carrega o arquivo json da url em "src"
                    fetch(this.src)
                        .then(retorno => retorno.json())
                        .then(json => {
                            this.dados = json;
                            this.atualizarDadosEditor();
                        })
                        .catch (e => alert (e));
                    
                        efetuouDownload = true;
                }
            }

            //Caso contrário exibe os dados recebidos para edição
            if (!efetuouDownload){
                this.atualizarDadosEditor();
            }
        }
    }  



    dispararEventoSelecaoObjeto(no){        

        if (no.path.length > 0){
            let dados = EditorJSON.trazerDado(no.path, this.dados);

            if (typeof dados === 'object'){
                
                this.dispatchEvent(new UltimaEvento(UltimaEvento.EVENTO_SELECAO_OBJETO,dados));
            }
        }
    }


    static trazerDado(caminho, dados){

        let dado = dados[caminho[0]];

        //Se é umd dado simples
        if (caminho.length == 1){
            return dado;

        //Se é um dado complexo, continua o caminho a partir daqui
        }else{

            return EditorJSON.trazerDado(caminho.slice(1), dado);
        }
    }



    criarEditor(){
        let container = this.noRaiz.querySelector("#editorJSON");
        let opcoes = {
            mode: 'tree',
            onEvent: (no, evento) =>{                

                if (evento.type.localeCompare("click") ==0){

                    this.dispararEventoSelecaoObjeto(no);


                }else  if (evento.type.localeCompare("input") ==0){
                    
                    let valorAntigo = this.dados;
                    this.dados = this.editor.get();
                    this.dispatchEvent(new CustomEvent("change", {detail:this.dados}));
                }
            }
        };
        this.editor = new JSONEditor(container, opcoes);        
        this.atualizarDadosEditor();
    }



    atualizarDadosEditor(){
        if (this.editor && this.dados){
            this.editor.set(this.dados);
            this.editor.expandAll();
        }
    }
}
customElements.define('editor-json', EditorJSON);