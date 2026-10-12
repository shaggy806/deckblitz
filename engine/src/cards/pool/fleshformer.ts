import { defineCard } from "../define.js";

export default defineCard({
  name: "Fleshformer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{W}{U}{B}{R}{G}: This creature gets +2/+2 and gains fear until end of turn. Target creature gets -2/-2 until end of turn. Activate only during your turn. (A creature with fear can't be blocked except by artifact creatures and/or black creatures.)",
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
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
                keyword: "fear",
                duration: "end-of-turn",
              },
            ],
          },
          { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{W}{U}{B}{R}{G}: This creature gets +2/+2 and gains fear until end of turn. Target creature gets -2/-2 until end of turn. Activate only during your turn.",
      condition: { kind: "your-turn" },
    },
  ],
});
