import { ComponenteBase } from '../componente_base.js';



export class EditorJSON extends ComponenteBase {

    static EVENTO_SELECAO_OBJETO = 'EVENTO_SELECAO_OBJETO';

    constructor(){
        super({templateURL:"/componentes/editor_json/editor_json.html", shadowDOM:true});

        this.addEventListener("carregou", () => {

            //Importa dinamicamente a biblioteca JSONEditor
            import(`${super.prefixoEndereco}/bibliotecas/jsoneditor/jsoneditor.js`).then(modulo => {

                this.criarEditor();                               
            });
        });
    }



    static get observedAttributes() {
        return ['dados'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

        if (nomeAtributo.localeCompare("dados") == 0){
            this.dados = JSON.parse(novoValor);
            this.atualizarDadosEditor();
        }
    }  



    dispararEventoSelecaoObjeto(no){        

        if (no.path.length > 0){
            let dado = EditorJSON.trazerDado(no.path, this.dados);

            if (typeof dado === 'object'){

                let eventoSelecaoObjeto = new CustomEvent (EditorJSON.EVENTO_SELECAO_OBJETO,{detail:dado});
                this.dispatchEvent(eventoSelecaoObjeto);
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
                }
            }
        };
        this.editor = new JSONEditor(container, opcoes);
        this.atualizarDadosEditor();
    }



    atualizarDadosEditor(){
        if (this.editor && this.dados){
            this.editor.set(this.dados);
        }
    }
}
customElements.define('editor-json', EditorJSON);