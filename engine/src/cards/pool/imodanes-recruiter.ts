import { defineCard } from "../define.js";

// EDHREC rank 18749. Wilds of Eldraine. Adventure: Train Troops. Only the
// creatures you control as the trigger resolves get the bonus (its ruling —
// rule 611.2c), Ajani Unrelenting's +1.
const ENTER_TEXT =
  "When this creature enters, creatures you control get +1/+0 and gain haste until end of turn.";

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Imodane's Recruiter",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Imodane's Recruiter", "Train Troops"],
  adventure: true,
});
