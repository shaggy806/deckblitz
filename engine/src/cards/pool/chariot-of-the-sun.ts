import { defineCard } from "../define.js";

// Mirage. Base toughness alone (layer 7b), with flying granted in layer 6.

const ABILITY = "{2}, {T}: Until end of turn, target creature you control gains flying and has base toughness 1.";

export default defineCard({
  name: "Chariot of the Sun",
  manaCost: "{3}",
  types: ["artifact"],
  text: ABILITY,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "become",
        target: 0,
        toughness: 1,
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
