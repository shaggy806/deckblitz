import { defineCard } from "../define.js";

export default defineCard({
  name: "Baloth Woodcrasher",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: "Landfall — Whenever a land you control enters, this creature gets +4/+4 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 4,
            toughness: 4,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, this creature gets +4/+4 and gains trample until end of turn.",
    },
  ],
});
