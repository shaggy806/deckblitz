import { defineCard } from "../define.js";

// EDHREC rank 4676.

const PREVENT_TEXT = "If damage would be dealt to you, prevent that damage and mill twice that many cards.";

// The damage is prevented even if the library is short (its ruling): `mill`
// takes what's there. `perEvent`: one simultaneous damage event (combat) is
// one replacement, milling twice the total (rule 614.5).

export default defineCard({
  name: "Angel of Suffering",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Angel"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        perEvent: true,
        to: "you",
        then: { kind: "mill", target: "you", amount: { product: ["x", 2] } },
      },
      text: PREVENT_TEXT,
    },
  ],
});
