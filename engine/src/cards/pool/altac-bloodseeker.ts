import { defineCard } from "../define.js";

export default defineCard({
  name: "Altac Bloodseeker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 2,
  toughness: 1,
  text: "Whenever a creature an opponent controls dies, this creature gets +2/+0 and gains first strike and haste until end of turn. (It deals combat damage before creatures without first strike, and it can attack and {T} as soon as it comes under your control.)",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 2,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "first-strike",
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Whenever a creature an opponent controls dies, this creature gets +2/+0 and gains first strike and haste until end of turn.",
    },
  ],
});
