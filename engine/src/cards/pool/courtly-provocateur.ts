import { defineCard } from "../define.js";

// Magic 2013 (M13). EDHREC rank 21609.

const ATTACKS = "{T}: Target creature attacks this turn if able.";
const BLOCKS = "{T}: Target creature blocks this turn if able.";

export default defineCard({
  name: "Courtly Provocateur",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${ATTACKS}\n${BLOCKS}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["must-attack"] },
      resolve: null,
      text: ATTACKS,
    },
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "block-if-able", target: 0 },
      resolve: null,
      text: BLOCKS,
    },
  ],
});
