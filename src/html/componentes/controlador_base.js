
//Os controladores recebem eventos. Para isso eles devem herdar de EventTarget
export class ControladorBase extends EventTarget{
    constructor(){
        super();       
    }
}