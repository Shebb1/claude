# Midnight Neon

Claude-Code-Theme (Mod). Folgt dem Hell/Dunkel-Modus des Systems.

- Tag: helle, natürliche Farben (warmes Papier, Ton-Orange)
- Abend: Mitternachtsblau/-lila mit Neon-Komplementärakzenten
- Panel "Halle 3" (`/halle`): isometrische Fabrikhalle. Blockfiguren zeigen live, was die Sitzung tut.

## Was die Halle zeigt

| Ereignis der Sitzung | In der Halle |
| --- | --- |
| Turn startet | Orchestrator legt eine Aufgabe aufs Band |
| Agent startet | Figur mit Hut ihres Modells bezieht eine Station, Kiste rollt an |
| Werkzeugaufruf | Sprechblase mit dem Werkzeug über der Figur |
| SendMessage, AskUserQuestion | Zettel fliegt |
| Agent beendet seinen Lauf | Figur ist fertig, Bericht fliegt zum Orchestrator |
| Turn endet | Gebündeltes Ergebnis landet beim Orchestrator |

Farben und Szene zeichnen nur Desktop- und Mobile-Client. Im Terminal zeigt das Panel eine Textliste.

## Dateien
- `hooks/register.tsx`: Farben, Ereignisse, Panel
- `hooks/scene.js`: zeichnet die Halle als SVG aus dem Zustand
- `types/index.d.ts`: Zustand der Halle
- `previews/halle-theme.html`: Vorschau mit Beispielablauf, Tag und Abend
- `previews/theme-vorschau.html`: frühere Farbvorschau
- `previews/fliessband-3d-entwurf.html`: früherer 3D-Entwurf (three.js)
