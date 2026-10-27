import { defineCard } from "../define.js";

// EDHREC rank 21560. A Spellshaper: Ridged Kusite's discard cost.

const TEXT = "{U}{U}, {T}, Discard a card: Counter target noncreature spell.";

export default defineCard({
  name: "Stronghold Machinist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}{U}", tap: true, discard: { count: 1 } },
      targets: ["noncreature-spell"],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
