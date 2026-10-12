import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

// "A creature that saddled it this turn" (rule 702.171c) is one tapped to
// pay its saddle cost this turn, still the same object (400.7) —
// `saddledSource`, read against the Beaver as the target is chosen.
const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, put a +1/+1 counter on target creature that saddled it this turn.";

export default defineCard({
  name: "Giant Beaver",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beaver", "Mount"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${ATTACK_TEXT}\n${saddleText(3)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [{ kind: "permanent", filter: { type: "creature", saddledSource: true } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(3, saddleText(3))],
});
