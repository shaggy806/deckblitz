import { defineCard } from "../define.js";

const TEXT = "{T}, Discard a card: Tap target creature.";

export default defineCard({
  name: "Stern Constable",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
