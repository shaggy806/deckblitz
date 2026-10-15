import { defineCard } from "../define.js";

// EDHREC rank 15019. Repartee is a cast trigger filtered on the spell's
// targets as it was cast (Informed Inkwright's shape), so it resolves first and
// even if the spell is countered or its targets leave (the rulings).

const REPARTEE_TEXT =
  "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Melancholic Poet",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Bard"],
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
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: REPARTEE_TEXT,
    },
  ],
});
