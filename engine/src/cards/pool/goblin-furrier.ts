import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 31815.
//
// Rulings:
//   [2006-07-15] If a spell or ability is cast or activated that would have Goblin Furrier deal
//     damage to a snow creature, and Goblin Furrier leaves the battlefield before it resolves, the
//     damage won't be prevented.

const TEXT = "Prevent all damage that this creature would deal to snow creatures.";

export default defineCard({
  name: "Goblin Furrier",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        fromSelf: true,
        toFilter: { type: "creature", supertype: "snow" },
      },
      text: TEXT,
    },
  ],
});
