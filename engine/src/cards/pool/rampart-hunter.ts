import { defineCard } from "../define.js";

export default defineCard({
  name: "Rampart Hunter",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWhen this creature enters, target creature gets +2/+2 and gains deathtouch until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this creature enters, target creature gets +2/+2 and gains deathtouch until end of turn.",
    },
  ],
});
