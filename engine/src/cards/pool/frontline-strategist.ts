import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 22202.
//
// "Non-Soldier" is asked of each source as its combat damage would be dealt (the ruling), which is
// how `prevent-all-combat-damage`'s `by` reads it.
const TEXT = "When this creature is turned face up, prevent all combat damage non-Soldier creatures would deal this turn.";

export default defineCard({
  name: "Frontline Strategist",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{W}" },
  text: `Morph {W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "prevent-all-combat-damage", by: { type: "creature", notSubtypes: ["Soldier"] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
