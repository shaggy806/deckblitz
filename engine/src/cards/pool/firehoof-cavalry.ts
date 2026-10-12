import { defineCard } from "../define.js";

export default defineCard({
  name: "Firehoof Cavalry",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 1,
  toughness: 1,
  text: "{3}{R}: This creature gets +2/+0 and gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
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
      text: "{3}{R}: This creature gets +2/+0 and gains trample until end of turn.",
    },
  ],
});
