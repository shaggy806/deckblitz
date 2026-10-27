import { defineCard } from "../define.js";

export default defineCard({
  name: "Avizoa",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{0}: This creature gets +2/+2 until end of turn. You skip your next untap step. Activate only once each turn.",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "skip-untap-step", who: "you" },
        ],
      },
      resolve: null,
      text: "{0}: This creature gets +2/+2 until end of turn. You skip your next untap step. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
