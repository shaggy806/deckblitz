import { defineCard } from "../define.js";

// EDHREC rank 20626.
//
// Eagles of the North's team pump, its first strike narrowed to Kithkin
// creatures. Both sets are fixed as the ability resolves (rule 611.2c).

const ENTER_TEXT =
  "When this creature enters, creatures you control get +1/+0 until end of turn. Kithkin creatures you control also gain first strike until end of turn.";

export default defineCard({
  name: "Gallant Fowlknight",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Knight"],
  power: 3,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", subtype: "Kithkin", controlledBy: "you" },
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
