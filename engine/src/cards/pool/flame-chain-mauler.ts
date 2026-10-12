import { defineCard } from "../define.js";

export default defineCard({
  name: "Flame-Chain Mauler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 2,
  toughness: 2,
  text: "{1}{R}: This creature gets +1/+0 and gains menace until end of turn. (It can't be blocked except by two or more creatures.)",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
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
            keyword: "menace",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{1}{R}: This creature gets +1/+0 and gains menace until end of turn.",
    },
  ],
});
