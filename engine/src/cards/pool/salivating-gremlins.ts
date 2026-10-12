import { defineCard } from "../define.js";

export default defineCard({
  name: "Salivating Gremlins",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Gremlin"],
  power: 2,
  toughness: 3,
  text: "Whenever an artifact you control enters, this creature gets +2/+0 and gains trample until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
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
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Whenever an artifact you control enters, this creature gets +2/+0 and gains trample until end of turn.",
    },
  ],
});
