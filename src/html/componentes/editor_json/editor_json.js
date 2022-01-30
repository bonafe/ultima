import { ComponenteBase } from '../componente_base.js';



export class EditorJSON extends ComponenteBase {



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



    criarEditor(){
        let container = this.noRaiz.querySelector("#editorJSON");
        let opcoes = {
            mode: 'tree',
            onEvent: (node, event) =>{
                if (event.type.localeCompare("click") ==0){
                    console.dir(node);
                    console.dir(event);
                    console.log ("!!!!!!!!!!!!mouseclick");
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