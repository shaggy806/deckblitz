import { defineCard } from "../define.js";

// Disguise {1}{R} (rule 702.168). "Any number of other spells and/or
// abilities": every one on the stack but this trigger, whoever's, each asked
// about in turn (rule 115.7d) — keeping all of one's targets is not choosing
// it. A division of damage or counters stays as it was (115.7f), and a
// variable number of targets keeps its number (the rulings).
const FACE_UP_TEXT =
  "When this creature is turned face up, you may choose new targets for any number of other spells and/or abilities.";

export default defineCard({
  name: "Boltbender",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 4,
  toughness: 2,
  text: `Disguise {1}{R} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{1}{R}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "change-targets", target: "each-other", how: "choose-new" },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
