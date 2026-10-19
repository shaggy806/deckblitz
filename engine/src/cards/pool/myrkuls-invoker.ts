import { defineCard } from "../define.js";

const TEXT = "Psychic Blades — {8}: Creatures you control get +2/+0 and gain menace until end of turn.";

export default defineCard({
  name: "Myrkul's Invoker",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cat", "Rogue"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (A creature with menace can't be blocked except by two or more creatures.)`,
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 2,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "menace",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
