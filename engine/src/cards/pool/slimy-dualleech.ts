import { defineCard } from "../define.js";

export default defineCard({
  name: "Slimy Dualleech",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 2,
  toughness: 4,
  text: "At the beginning of combat on your turn, target creature you control with power 2 or less gets +1/+0 and gains deathtouch until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", power: { op: "lte", n: 2 } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, target creature you control with power 2 or less gets +1/+0 and gains deathtouch until end of turn.",
    },
  ],
});
