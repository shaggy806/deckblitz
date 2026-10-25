import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

const TEXT =
  "{3}{B}, Sacrifice this enchantment: Return up to three target creature cards from your graveyard to your hand.";

export default defineCard({
  name: "Font of Return",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false, sacrifice: "self" },
      targets: distinctTargets(3, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
          { kind: "return-to-hand", target: 2, from: "graveyard" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
