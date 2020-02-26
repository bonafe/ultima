"use strict";
class ObjetoRemotoView{

	constructor(container){
		this.container = container;
		
		this.inputEndPoint = document.createElement("input");
		this.inputEndPoint.type = "text";
		this.inputEndPoint.placeHolder = "Endpoint";
		this.inputEndPoint.name = "endpoint";
		this.inputEndPoint.value = "http://localhost:8080/listaEquipes";
		
		this.container.appendChild(this.inputEndPoint);
		
		
		this.botaoCarregarEndPoint = document.createElement ("input");
		this.botaoCarregarEndPoint.type = "button";		
		this.botaoCarregarEndPoint.name = "botaoEndpoint";
		this.botaoCarregarEndPoint.value = "Carregar";					
		
		this.container.appendChild(this.botaoCarregarEndPoint);
		
		
		this.divObjetoRemoto = document.createElement("div");		
		
		this.container.appendChild(this.divObjetoRemoto);
	}
	
	
	
	bindCarregarEndpoint(handler){
		
		this.botaoCarregarEndPoint.addEventListener('click', event => {
			handler (this.inputEndPoint.value);
		});
	}
	
	
	
	construirCampo (campo, valor, container){
		
		let divCampo = document.createElement("div");
		let spanNomeValor = document.createElement ("span");
		spanNomeValor.innerHTML = campo;
		
		let inputValor = document.createElement("input");
		inputValor.type = "text";
		inputValor.value = valor;
		
		spanNomeValor.appendChild (inputValor);
		
		divCampo.appendChild (spanNomeValor);
		
		container.appendChild (divCampo);
	}
	
	
	
	construirObjeto(campoRaiz, objeto, container, nivel){
		
		let divObjeto = document.createElement("div");
		divObjeto.classList.add("objeto");
		divObjeto.style.marginLeft = (nivel*2) + "px";
		
		let h1TituloObjeto = document.createElement ("h1");
		h1TituloObjeto.innerHTML = "Objeto: " + campoRaiz;
		
		divObjeto.appendChild (h1TituloObjeto);
						
		
		for (let campo in objeto){
		
			if (Array.isArray(objeto[campo])) {
				this.construirArray (campo, objeto[campo], divObjeto, ++nivel);
			
			}else if ((typeof objeto[campo] === "object") && (objeto[campo] != null)){
				this.construirObjeto (campo, objeto[campo], divObjeto, ++nivel);
				
			}else{
			
				this.construirCampo (campo, objeto[campo], divObjeto, ++nivel);
			}
		}
		
		container.appendChild (divObjeto);
	}	
	
	
	
	construirArray(campoRaiz, array, container, nivel){
		
		let divArray = document.createElement ("div");
		divArray.classList.add("array");
		divArray.style.marginLeft = (nivel*2) + "px";
		
		
		let h1TituloArray = document.createElement ("h1");
		h1TituloArray.innerHTML = "Array: " + campoRaiz;
		
		divArray.appendChild (h1TituloArray);
		
		
		let ulArray = document.createElement ("ul");		
		
		for (let indice in array){
			
			let liArray = document.createElement ("li");
			
			if (Array.isArray(array[indice])) {
				this.construirArray (indice, array[indice], liArray);
			
			}else if ((typeof array[indice]  === "object") && (array[indice] != null)){
				this.construirObjeto (indice, array[indice], liArray, ++nivel);
				
			}else{
			
				this.construirCampo (indice, array[indice], liArray, ++nivel);						
			}
			
			ulArray.appendChild (liArray);
		}
		
		divArray.appendChild (ulArray);
		
		container.appendChild (divArray);
	}
	
	
	
	renderizarObjetoRemoto(objetoRemoto){
		
		let nivel = 0;
		
		if (Array.isArray (objetoRemoto)){
			this.construirArray ("Objeto Raiz", objetoRemoto, this.container, ++nivel);
		
		}else if (typeof objetoRemoto  === "object"){
			
			this.construirObjeto ("Objeto Raiz", objetoRemoto, this.container, ++nivel);
		}
										
	}
}