import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 24487.

const TEXT = "{U}{U}, {T}, Discard a card: Counter target creature spell.";

export default defineCard({
  name: "Stronghold Biologist",
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
      targets: ["creature-spell"],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
