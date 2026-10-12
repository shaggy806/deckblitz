import { defineCard } from "../define.js";

export default defineCard({
  name: "Battlesong Berserker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 3,
  toughness: 4,
  text: "Whenever you attack, target creature you control gets +1/+0 and gains menace until end of turn. (It can't be blocked except by two or more creatures.)",
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever you attack, target creature you control gets +1/+0 and gains menace until end of turn.",
    },
  ],
});
