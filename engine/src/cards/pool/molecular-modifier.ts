import { defineCard } from "../define.js";

export default defineCard({
  name: "Molecular Modifier",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu", "Artificer"],
  power: 2,
  toughness: 2,
  text: "At the beginning of combat on your turn, target creature you control gets +1/+0 and gains first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, target creature you control gets +1/+0 and gains first strike until end of turn.",
    },
  ],
});
