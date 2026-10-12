import { defineCard } from "../define.js";

export default defineCard({
  name: "Fault Riders",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Sacrifice a land: This creature gets +2/+0 and gains first strike until end of turn. Activate only once each turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "land" } } },
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
        ],
      },
      resolve: null,
      text: "Sacrifice a land: This creature gets +2/+0 and gains first strike until end of turn. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
