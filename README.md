# Spec Tree

Esta é uma extensão para VS Code para visualizar testes do RSpec na estrutura de uma árvore.


## Features

  * Carregamento de specs em JSON
  * Tratamento para reconhecer nomes de grupos e testes
  * *Go to* para o arquivo e linha do teste


## Setup

* Gerando o arquivo 'rspec_doc.json':
  Através do RSpec, gere um arquivo 'rspec_doc.json' com os testes do seu projeto:

  `rspec -fjson -o rspec_doc.json`

  ou, para um teste específico:

  `rspec sua_classe_de_teste_spec.rb -fjson -o rspec_doc.json`


  Você também pode executar o rspec de maneira rápida utilizando o parâmetro --dry-run:

  `rspec --dry-run -fjson -o rspec_doc.json`

  ou, para um teste específico:

  `rspec sua_classe_de_teste_spec.rb --dry-run -fjson -o rspec_doc.json`


* Depois execute o comando `> Load RSpec Doc JSON file (spec_doc.json)` e visualize a árvore de testes do seu projeto.

## Known Issues

* Automatizar a geração do arquivo spec_doc.json
* Externalizar para a configuração as palavras usadas para quebrar nomes

**Enjoy!**
