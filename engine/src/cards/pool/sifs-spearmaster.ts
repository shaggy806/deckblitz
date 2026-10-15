import { defineCard } from "../define.js";

// EDHREC rank 24660.
// Its power as the ability resolves (or as it last existed, if it has left).

const TEXT = "{T}: This creature deals damage equal to its power to target opponent.";

export default defineCard({
  name: "Sif's Spearmaster",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["God", "Warrior", "Hero"],
  power: 1,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["opponent"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
