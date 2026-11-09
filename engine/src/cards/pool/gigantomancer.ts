import { defineCard } from "../define.js";

const ABILITY = "{1}: Target creature you control has base power and toughness 7/7 until end of turn.";

export default defineCard({
  name: "Gigantomancer",
  manaCost: "{7}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  text: ABILITY,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      // Layer 7b, timestamped as it resolves: it overrides a leveler's level
      // symbol (the rulings); pumps and counters still apply on top.
      effect: { kind: "become", target: 0, power: 7, toughness: 7, duration: "end-of-turn" },
      resolve: null,
      text: ABILITY,
    },
  ],
});
