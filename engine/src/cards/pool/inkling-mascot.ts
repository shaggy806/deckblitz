import { defineCard } from "../define.js";

// EDHREC rank 21215.
//
// Repartee: a cast trigger whose filter asks what the spell targets as it's
// cast (Informed Inkwright's shape), so the creature leaving or the spell
// being countered changes nothing once it has triggered (the rulings).
const REPARTEE_TEXT =
  "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature gains flying until end of turn. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)";

export default defineCard({
  name: "Inkling Mascot",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Inkling", "Cat"],
  power: 2,
  toughness: 2,
  text: REPARTEE_TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "surveil", amount: 1 },
        ],
      },
      resolve: null,
      text: REPARTEE_TEXT,
    },
  ],
});
