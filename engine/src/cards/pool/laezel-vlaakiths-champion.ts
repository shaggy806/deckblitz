import { defineCard } from "../define.js";

// EDHREC rank 1437. Reads who puts them, as Vorinclex does: counters you put, on
// your own creature or planeswalker or on yourself, energy included.

const TEXT =
  "If you would put one or more counters on a creature or planeswalker you control or on yourself, put that many plus one of each of those kinds of counters on that permanent or player instead.";

export default defineCard({
  name: "Lae'zel, Vlaakith's Champion",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gith", "Warrior"],
  power: 3,
  toughness: 3,
  pairing: { kind: "choose-a-background" },
  text: `${TEXT}\nChoose a Background`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-add-counter",
        instead: { modify: { plus: 1 } },
        whoPuts: "you",
        onPlayers: "you",
        filter: { typesAnyOf: ["creature", "planeswalker"], controlledBy: "you" },
      },
      text: TEXT,
    },
  ],
});
