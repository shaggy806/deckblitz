import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 17321.

const ENTER_TEXT = "When this Siege enters, put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Invasion of Moag",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 5,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Moag", "Bloomwielder Dryads"],
  transform: true,
});
