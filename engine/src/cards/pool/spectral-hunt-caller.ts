import { defineCard } from "../define.js";

// EDHREC rank 23836.

export default defineCard({
  name: "Spectral Hunt-Caller",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf", "Spirit"],
  power: 4,
  toughness: 4,
  text: "{5}{G}: Creatures you control get +1/+1 and gain trample until end of turn.",
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{5}{G}: Creatures you control get +1/+1 and gain trample until end of turn.",
    },
  ],
});
