import { defineCard } from "../define.js";

// EDHREC rank 22956.
//
// Rulings:
//   With convoke and {X}, X is chosen first; that plus any cost changes is the
//   total cost, which tapped creatures then help pay.

export default defineCard({
  name: "Worldsoul Colossus",
  manaCost: "{X}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nThis creature enters with X +1/+1 counters on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
  ],
});
