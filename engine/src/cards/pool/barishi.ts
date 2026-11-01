import { defineCard } from "../define.js";

// Alliances (ALL). Exiled first, so it isn't among the creature cards
// shuffled in; the rest go whether the exile happened or not (no "if you
// do").

const TEXT = "When this creature dies, exile it, then shuffle all creature cards from your graveyard into your library.";

export default defineCard({
  name: "Barishi",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "shuffle-graveyard-into-library", target: "you", filter: { type: "creature" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
