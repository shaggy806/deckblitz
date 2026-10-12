import { defineCard } from "../define.js";

export default defineCard({
  name: "Looming Spires",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\nWhen this land enters, target creature gets +1/+1 and gains first strike until end of turn.\n{T}: Add {R}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "When this land enters, target creature gets +1/+1 and gains first strike until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
