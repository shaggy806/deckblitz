import { defineCard } from "../define.js";

// Disguise {4}{B}{B} (rule 702.168). Cast face down it has none of these
// abilities, so it enters untapped; turned face up it's already on the
// battlefield, so "enters tapped" never applies then either.

const FACE_UP_TEXT = "When this creature is turned face up, target opponent loses 3 life and you gain 3 life.";

export default defineCard({
  name: "Alley Assailant",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 3,
  toughness: 3,
  text: `This creature enters tapped.\nDisguise {4}{B}{B} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{4}{B}{B}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3, target: 0 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
