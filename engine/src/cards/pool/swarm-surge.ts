import { defineCard } from "../define.js";

// Both sets are fixed as it resolves (rule 611.2c): a creature that stops
// being colorless keeps first strike (the ruling).
export default defineCard({
  name: "Swarm Surge",
  manaCost: "{2}{B}",
  colors: [],
  types: ["sorcery"],
  text: "Devoid (This card has no color.)\nCreatures you control get +2/+0 until end of turn. Colorless creatures you control also gain first strike until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", colorless: true },
        keyword: "first-strike",
        duration: "end-of-turn",
      },
    ],
  },
});
