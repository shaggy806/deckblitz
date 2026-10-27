import { defineCard } from "../define.js";

// EDHREC rank 31256. Rampant Elephant's lure.

const LURE = "{1}{G}: Target creature blocks this creature this turn if able.";

export default defineCard({
  name: "Trumpeting Armodon",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 3,
  toughness: 3,
  text: LURE,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "block-if-able", target: 0, attacker: "source" },
      resolve: null,
      text: LURE,
    },
  ],
});
