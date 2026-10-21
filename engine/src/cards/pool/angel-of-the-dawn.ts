import { defineCard } from "../define.js";

// EDHREC rank 16987.
//
// Rulings:
//   Only the creatures you control as the ability resolves get the bonus.

const ETB_TEXT = "When this creature enters, creatures you control get +1/+1 and gain vigilance until end of turn.";

export default defineCard({
  name: "Angel of the Dawn",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
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
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "vigilance",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
