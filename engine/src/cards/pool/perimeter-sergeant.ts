import { defineCard } from "../define.js";

// EDHREC rank 25981. Ikoria: Lair of Behemoths.
const TRIGGER_TEXT = "Whenever this creature attacks, other Humans you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Perimeter Sergeant",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Human", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
