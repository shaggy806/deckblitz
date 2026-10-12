import { defineCard } from "../define.js";

export default defineCard({
  name: "Oran-Rief Invoker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{8}: This creature gets +5/+5 and gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 5,
            toughness: 5,
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
      text: "{8}: This creature gets +5/+5 and gains trample until end of turn.",
    },
  ],
});
