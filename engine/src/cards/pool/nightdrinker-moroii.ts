import { defineCard } from "../define.js";

// Disguise {B}{B} (rule 702.168). Cast face down it enters with no abilities,
// and turning it face up isn't entering, so the life loss happens only when it
// enters face up.

const ENTER_TEXT = "When this creature enters, you lose 3 life.";

export default defineCard({
  name: "Nightdrinker Moroii",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\nDisguise {B}{B} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)`,
  morph: { keyword: "disguise", cost: "{B}{B}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
