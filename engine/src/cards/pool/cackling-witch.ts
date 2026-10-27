import { defineCard } from "../define.js";

const TEXT = "{X}{B}, {T}, Discard a card: Target creature gets +X/+0 until end of turn.";

export default defineCard({
  name: "Cackling Witch",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{B}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
