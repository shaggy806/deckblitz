import { defineCard } from "../define.js";

export default defineCard({
  name: "Clickslither",
  manaCost: "{1}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\nSacrifice a Goblin: This creature gets +2/+2 and gains trample until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Goblin" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 2,
            toughness: 2,
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
      text: "Sacrifice a Goblin: This creature gets +2/+2 and gains trample until end of turn.",
    },
  ],
});
