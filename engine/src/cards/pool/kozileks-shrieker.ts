import { defineCard } from "../define.js";

export default defineCard({
  name: "Kozilek's Shrieker",
  manaCost: "{2}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 2,
  text: "Devoid (This card has no color.)\n{C}: This creature gets +1/+0 and gains menace until end of turn. (It can't be blocked except by two or more creatures. {C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: "{C}", tap: false },
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
      text: "{C}: This creature gets +1/+0 and gains menace until end of turn.",
    },
  ],
});
