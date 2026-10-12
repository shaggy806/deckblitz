import { defineCard } from "../define.js";

export default defineCard({
  name: "Kruin Striker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: "Whenever another creature you control enters, this creature gets +1/+0 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 1,
            toughness: 0,
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
      text: "Whenever another creature you control enters, this creature gets +1/+0 and gains trample until end of turn.",
    },
  ],
});
