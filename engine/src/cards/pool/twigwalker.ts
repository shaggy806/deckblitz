import { defineCard } from "../define.js";

// EDHREC rank 31360. Symbiosis's two distinct target slots.

const TEXT = "{1}{G}, Sacrifice this creature: Two target creatures each get +2/+2 until end of turn.";

export default defineCard({
  name: "Twigwalker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: "self" },
      targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
