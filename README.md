# UltimaJS

## O que é?

UltimaJS é uma implementação em JavaScript Vanilla de um framework para criar Single Page Applications (SPAs) utilizando a arquitetura Model-visualizacao-Controller (MVC).


## Porque usar javascript vanilla

Como desenvolvedores JavaScript, compreendemos que é uma boa prática escrever o máximo de código que funcione nativamente nos navegadores. Acreditamos que quanto mais independente de ferramentas externas for o código que roda no navegador, mais fácil será para os desenvolvedores e maior será a autonomia deles. Por essa razão, desenvolvemos o framework UltimaJS totalmente em código JavaScript nativo, fazendo amplo uso de APIs nativas, como a Indexed DB, Service Workers, Media API, entre outras.


## MVC e Orientação à Objetos

Entendemos que boas práticas de arquitetura resultam em código mais legível, modularizado e reutilizável, e que a estruturação do projeto com base na Orientação a Objetos é uma dessas boas práticas. Portanto, utilizamos uma arquitetura MVC para separar as camadas de dados, visualização e controle de estado da aplicação.

As classes de objetos presentes neste framework podem ser estendidas para criar novos componentes que herdam características de componentes genéricos, conhecidos pelo framework. Isso elimina a necessidade de escrever código para manter os estados e visualizações dos elementos.


## História

O projeto Ultima começou com um protótipo de visualização que usava o gráfico do tipo Treemap para exibir elementos em uma página HTML. Foi criada uma arquitetura do tipo Model-visualizacao-Controller (MVC), na qual elementos que estendem HTMLElement têm seus dados persistidos usando a API IndexedDB, uma API nativa dos navegadores para armazenamento e consulta de dados.

Posteriormente, os visualizadores renderizam esses elementos de várias formas, incluindo a proposta inicial da visualização em treemap, alternando para janelas e outros tipos de interfaces de visualização de dados que podem ser carregados dinamicamente.

O projeto Ultima oferece um ambiente de Single Page Application (SPA) no qual os desenvolvedores podem criar seus próprios elementos e controladores, utilizá-los em um ambiente que automaticamente gerencia estados e disponibiliza diversas formas de visualização de grupos de elementos HTML, além de possibilitar a extensão de seus componentes.


## Sobre o nome do projeto

"Última" é o nome de uma embarcação em uma fanfic do anime One Piece. 

Queremos que este framework seja o seu barco para navegar na criação de novas e intercambiáveis aplicações.


## Referências

Thinking with Joins
https://bost.ocks.org/mike/join/

General Update Pattern, I
https://bl.ocks.org/mbostock/3808218

Les Misérables Co-occurrence
https://bost.ocks.org/mike/miserables/

Path Transitions
https://bost.ocks.org/mike/path/

Scatterplot Matrix Brushing
https://bl.ocks.org/mbostock/4063663