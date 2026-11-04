import { defineCard } from "../define.js";

// Warhammer 40,000 Commander. One spell from among the hand and the graveyard
// together; life is the only way offered, X is 0, and additional costs may
// still be paid (the rulings).
const ATTACK_TEXT =
  "Lord of the Pyrrhian Legions — Whenever Anrakyr the Traveller attacks, you may cast an artifact spell from your hand or graveyard by paying life equal to its mana value rather than paying its mana cost.";

export default defineCard({
  name: "Anrakyr the Traveller",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  supertypes: ["legendary"],
  power: 4,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: { zones: ["hand", "graveyard"] },
        spell: { type: "artifact" },
        byPayingLife: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
