import { defineCard } from "../define.js";

// Each activation is another turn to skip (rule 614.10a), though only one can
// be activated a turn. "Once each turn" is per Chronatog (the ruling).
export default defineCard({
  name: "Chronatog",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Atog"],
  power: 1,
  toughness: 2,
  text: "{0}: This creature gets +3/+3 until end of turn. You skip your next turn. Activate only once each turn.",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "skip-turn", who: "you" },
        ],
      },
      oncePerTurn: true,
      resolve: null,
      text: "{0}: This creature gets +3/+3 until end of turn. You skip your next turn. Activate only once each turn.",
    },
  ],
});
