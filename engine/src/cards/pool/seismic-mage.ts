import { defineCard } from "../define.js";

const TEXT = "{2}{R}, {T}, Discard a card: Destroy target land.";

export default defineCard({
  name: "Seismic Mage",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true, discard: { count: 1 } },
      targets: ["land"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
