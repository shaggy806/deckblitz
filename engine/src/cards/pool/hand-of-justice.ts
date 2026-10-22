import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 26702.
//
// Rulings:
//   - It can destroy one of the three creatures it taps.
//
// The three tapped creatures are three others: Hand of Justice taps for its own {T}.
const TEXT = "{T}, Tap three untapped white creatures you control: Destroy target creature.";

export default defineCard({
  name: "Hand of Justice",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 2,
  toughness: 6,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        tapOthers: { count: 3, filter: { type: "creature", colors: ["W"], controlledBy: "you" } },
      },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
