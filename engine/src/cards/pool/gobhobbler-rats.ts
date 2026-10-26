import { defineCard } from "../define.js";

// EDHREC rank 27225.

const TEXT =
  'Hellbent — As long as you have no cards in hand, this creature gets +1/+0 and has "{B}: Regenerate this creature." (The next time it would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)';

export default defineCard({
  name: "Gobhobbler Rats",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      grantPt: [1, 0],
      grantsActivated: [
        {
          cost: { mana: "{B}", tap: false },
          targets: [],
          effect: { kind: "regenerate", target: "source" },
          resolve: null,
          text: "{B}: Regenerate this creature.",
        },
      ],
      text: TEXT,
    },
  ],
});
