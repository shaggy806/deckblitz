import { defineCard } from "../define.js";

// "Creatures you control" are fixed as it resolves (rule 611.2c).
const CAST_TEXT =
  "Whenever you cast a noncreature spell, you may pay {1}. If you do, Moku gets +2/+1 and creatures you control gain haste until end of turn.";

export default defineCard({
  name: "Moku, Meandering Drummer",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Bard", "Ally"],
  power: 2,
  toughness: 2,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to pump Moku and give your creatures haste?",
        cost: "{1}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
            {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "haste",
              duration: "end-of-turn",
            },
          ],
        },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
