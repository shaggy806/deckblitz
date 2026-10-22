import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 29052.
//
// Rulings:
//   [2009-10-01] If the targeted permanent or player is an illegal target by the time Banshee's
//     ability resolves, the ability doesn't resolve. You won't be dealt damage.
//
// Both halves are one damage event (Granger Guildmage's shape), each half of
// X rounded the way the card says (rule 107.1a).

const TEXT =
  "{X}, {T}: This creature deals half X damage, rounded down, to any target, and half X damage, rounded up, to you.";

export default defineCard({
  name: "Banshee",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: { half: "x", round: "down" }, target: 0 },
          { kind: "damage", amount: { half: "x", round: "up" }, who: "you" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
