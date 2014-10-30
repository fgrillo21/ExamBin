# ExaM JS Bin

ExaM JS Bin è un progetto open source creato per fare esami di informatica all'università, basato sul tool open source per debugging collaborativo a livello di sviluppo web denominato JS Bin ([jsbin.com](http://jsbin.com)).

## Cosa consente di fare ExaM JS Bin?

* Permette al docente di realizzare una domanda di HTML e/o CSS e/o Javascript e/o vari framework, di cui può fornire codice mezzo completato, o con errori.
* In un laboratorio chiuso ad Internet, ma collegato ad un server su cui gira una versione di ExaM JS Bin, consente agli studenti dopo una procedura di login di avere a disposizione un ambiente di lavoro JS Bin like semplificato, per poter rispondere alla domanda posta dal docente, avendo sempre a disposizione console e output del compito che stanno redigendo. 
* Permette di salvare il compito di ogni studente in una copia privata aggiungendo nome, cognome e matricola dell'alunno in questione; il meccanismo di salvataggio viene attivato ad ogni modifica apportata dallo studente nell'interfaccia dove realizza il compito. 
* Dopo aver effettuato le modifiche necessarie al testo per risolvere l'esercizio, lo studente ha la possibilità di dichiarare di aver concluso il compito e consegnarlo al docente per la correzione.
* Infine permette al professore di correggere/validare i compiti di una certa sessione d'esame, in maniera standar e/o personalizzata, eseguendo un test su ogni compito e generando un rapporto completo.

## Who built this?

ExaM JS Bin è stato realizzato interamente da Matteo Borghi, studente laurendo della facoltà di Informatica per il Management dell'Università di Bologna, per adempiere al proprio tirocinio curricolare.

ExaM JS Bin è stato ottenuto tramite un fork al progetto open source jsbin disponibile all'indirizzo [http://github.com/jsbin/jsbin](http://github.com/jsbin/jsbin).

## Componenti del progetto

Il progetto è stato pensato per due categorie di utenti, studenti e professori:
* [Interfaccia professore](/docs/professor-interface.md)
* [Interfaccia studente](/docs/student-interface.md)
    

## Build Process

JS Bin has been designed to work both online at [jsbin.com](http://jsbin.com) but also in your own locally hosted environment - or even live in your own site (if you do host it as a utility, do let us know by pinging [@js_bin](http://twitter.com/js_bin) on twitter).

Historically JS Bin was built on PHP, but has since moved to Node. The PHP flavour is no longer supported, however everything else [released in v3.0.0](https://github.com/jsbin/jsbin/tags) of JS Bin is available in both, but all releases after are only supported in the Node environment. Your PHP mileage may vary!

For detailed instructions on how to build JS Bin please see the [running your own JS Bin document](/docs/running-your-own-jsbin.md).

If you install [Node.js](http://nodejs.org) installation is easy:

    $ npm install -g jsbin
    $ jsbin

Optionally point JS Bin to your config:

    $ JSBIN_CONFIG=~/config.local.json jsbin

Then open your browser to [http://localhost:3000](http://localhost:3000) and you have a fully working version of JS Bin running locally.

## API

A simple REST based API exists for anonymous users if it is enabled in your config.\*.json, or can be restricted to registered users with a key specified in `ownership.api_key`

Authentication is required for all API requests unless one of the following api configuration options are set:

- `api.allowAnonymousReadWrite` - if set to true allows GET and POST operations to the API anonymously (without an API key)
- `api.allowAnonymousRead` - if set to true allows GET operations to the API anonymously (without an API key)

By default, `config.default.json` has `api.allowAnonymousRead` set to true.

Curl authentication examples:

```
$ curl http://{{host}}/api/:bin -H "Authorization: token {{token_key}}"
$ curl http://{{host}}/api/:bin?api_key={{token_key}}
```

End points are:

- `GET /api/:bin` - Retrieve the latest version of the bin with that specified ID
- `GET /api/:bin/:rev` - Retrieve the specific version of the bin with the specified ID and revision
- `POST /api/save` - Create a new bin, the body of the post should be URL encoded and contain `html`, `javascript` and `css` parameters
- `POST /api/:bin/save` - Create a new revision for the specified bin, the body of the post should be URL encoded and contain `html`, `javascript` and `css` parameters