import { defineCard } from "../define.js";

const EVASION_TEXT = "This creature can't be blocked by creatures with power 3 or greater.";
const DISGUISE_TEXT =
  "Disguise {1}{U} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const FACE_UP_TEXT = "When this creature is turned face up, return another target creature to its owner's hand.";

// Disguise {1}{U} (rule 702.168): face down it's a 2/2 with ward {2} and none
// of these abilities; turned face up it doesn't enter (708.8), and a block
// already declared stays (the rulings).
export default defineCard({
  name: "Exit Specialist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 1,
  text: `${EVASION_TEXT}\n${DISGUISE_TEXT}\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{1}{U}" },
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gte", n: 3 } },
      text: EVASION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
