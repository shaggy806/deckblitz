import { defineCard } from "../define.js";

export default defineCard({
  name: "Cavalry Drillmaster",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, target creature gets +2/+0 and gains first strike until end of turn. (It deals combat damage before creatures without first strike.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, target creature gets +2/+0 and gains first strike until end of turn.",
    },
  ],
});
