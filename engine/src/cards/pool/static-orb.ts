import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] If there are two of these on the battlefield, they do not add together. The result
//     is that only two permanents can be untapped.

const TEXT = "As long as this artifact is untapped, players can't untap more than two permanents during their untap steps.";

export default defineCard({
  name: "Static Orb",
  manaCost: "{3}",
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      untapLimit: { who: "each-player", count: 2 },
      text: TEXT,
    },
  ],
});
