# Pizza Panic — Fullstack Engineering Challenge

**Tijd:** ongeveer 1,5 tot 2 uur thuis, daarna een gesprek van 45 minuten waarin we samen door je werk lopen.

Over AI: gebruik het rustig. We gaan er sowieso vanuit dat je het inzet, dus daar doen we niet moeilijk over. Waar het ons om gaat is of je begrijpt wat je bouwt en waarom je bepaalde keuzes maakt.

## Het verhaal

Tony heeft een pizzeria. Twaalf bezorgers, vier ovens, en geen enkele vorm van software. Bestellingen komen binnen via post-its, telefoontjes en af en toe puur op geheugen. Het is een zooitje en er gaat geregeld iets mis.

Jij gaat hem helpen met Pizza Panic: een systeem waarmee het team bestellingen aanneemt, door de keuken volgt en de bezorging bijhoudt, voordat de pizza koud aankomt.

## Wat het moet kunnen

- Een bestelling aanmaken met klant, pizza's en adres. Een bestelling doorloopt een paar statussen: ontvangen, in de oven, onderweg, bezorgd. En soms helaas: verbrand.
- Een overzicht van alle bestellingen dat je op status kunt filteren.
- Een detailpagina per bestelling waar je de status kunt aanpassen.
- Een signaal wanneer een bestelling te lang in dezelfde status blijft hangen. Tony moet in één oogopslag kunnen zien waar het vastloopt.
- Persistentie. Na een refresh moet de data er nog zijn.

En dan één onderdeel dat wat meer nadenken vraagt: de keukenschermen en het bezorgersscherm moeten redelijk snel meekrijgen wanneer een status verandert. Of je dat met polling, SSE of websockets doet maakt ons niet uit.

## Wat we expres open laten

Niet alles staat dichtgetimmerd, en dat is bewust. Probeer de juiste keuzes te maken.

- Tech stack: fullstack TypeScript heeft onze voorkeur, maar pak waar je goed in bent.
- Auth hoeft niet. Schrijf in je README wel even hoe je het zou aanpakken.
- Tony wil groeien. Beschrijf in je README wat er zou breken als dit 10.000 bestellingen per dag moet verwerken.
- De opdracht is iets te groot voor de tijd. Dat is met opzet. Knip waar nodig en vertel ons wat je hebt laten liggen.

## Wanneer is het af

Het draait lokaal met één commando, of met een README die helder genoeg is dat we er zonder gepuzzel uitkomen. Er is een werkende frontend, backend en database. Het signaal bij vastgelopen bestellingen doet zichtbaar iets, en de updates komen redelijk live binnen. En er ligt een README waarin je je keuzes en afwegingen uitlegt, inclusief wat je niet hebt gedaan en waarom.

**Je gehele prompting history is vastgelegd in een prompt-history.md**

We zien liever iets werkends dat half af is dan iets perfects dat niet draait.

## Mocht je tijd overhouden

Niks hiervan is verplicht, maar leuk als het lukt: een dashboardje met aantallen per status, een paar tests op het stuk dat jij het belangrijkst vindt, of een verbrand-knop met een grappige melding.
