import { defineCard } from "../define.js";

export default defineCard({
  name: "Most Valuable Slayer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 4,
  text: "Whenever you attack, target attacking creature gets +1/+0 and gains first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
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
      text: "Whenever you attack, target attacking creature gets +1/+0 and gains first strike until end of turn.",
    },
  ],
});
