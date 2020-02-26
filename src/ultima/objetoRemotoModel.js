"use strict";
class ObjetoRemotoModel{		
	
	
	
	constructor(){
		this.objetoRemoto = JSON.parse(localStorage.getItem("objetoRemoto")) || {};
	}
	
	
	
	bindObjetoRemotoMudou(callback){
		
		this.onMudouObjetoRemoto = callback;				
	}
	
	
		
	atualizarObjetoRemoto (objetoRemoto){
		
		this.objetoRemoto = objetoRemoto;
		
		localStorage.setItem ("objetoRemoto", JSON.stringify(this.objetoRemoto));
		
		this.onMudouObjetoRemoto (this.objetoRemoto);
	}
}