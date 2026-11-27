import { defineCard } from "../define.js";

// EDHREC rank 22499.
//
// Rulings (the card's own; the rest are disguise's):
//   If Crowd-Control Warden enters the battlefield at the same time as one or
//     more creatures, those creatures won't count for the purposes of
//     Crowd-Control Warden's first ability.
//   Because the permanent is on the battlefield both before and after it's
//     turned face up, turning a permanent face up doesn't cause any
//     enters-the-battlefield abilities to trigger.
//
// Two halves: an `enters-battlefield` replacement as it enters (face up —
// cast face down it has no abilities, 708.2a), and `asTurnedFaceUp`'s
// counters counted as it's turned face up (rule 708.8: it doesn't enter).

const COUNTERS =
  "As this creature enters or is turned face up, put X +1/+1 counters on it, where X is the number of other creatures you control.";
const OTHERS = { countOf: { type: "creature", controlledBy: "you" }, excludeSelf: true } as const;

export default defineCard({
  name: "Crowd-Control Warden",
  manaCost: "{3}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Centaur", "Soldier"],
  power: 4,
  toughness: 4,
  text: `${COUNTERS}\nDisguise {3}{G/W}{G/W} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)`,
  morph: { keyword: "disguise", cost: "{3}{G/W}{G/W}" },
  asTurnedFaceUp: { counters: OTHERS },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: OTHERS } },
      text: COUNTERS,
    },
  ],
});
