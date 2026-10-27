import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31427. A `block-if-able` requirement naming this
// creature as the attacker (provoke's shape, without the untap).

const LURE = "{G}: Target creature blocks this creature this turn if able.";

export default defineCard({
  name: "Rampant Elephant",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 2,
  toughness: 2,
  text: LURE,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "block-if-able", target: 0, attacker: "source" },
      resolve: null,
      text: LURE,
    },
  ],
});
