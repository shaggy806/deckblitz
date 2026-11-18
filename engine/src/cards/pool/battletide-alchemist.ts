import { defineCard } from "../define.js";

// Rulings:
//   If a source would deal damage to multiple players at the same time, you may prevent X damage
//   that source would deal to each of those players. The choice for each player is made
//   separately.
//   You count the number of Clerics you control at the time the damage would be dealt.
//   If the same source would deal damage to a player at different times, you may prevent X of
//   that damage each time.
//
// A "you may" prevention (`may`), asked of this creature's controller for each source and each
// player as the damage would be dealt; X (`prevent: { count }`) is counted then.

const TEXT =
  "If a source would deal damage to a player, you may prevent X of that damage, where X is the number of Clerics you control.";

export default defineCard({
  name: "Battletide Alchemist",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Cleric"],
  power: 3,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "player",
        instead: { prevent: { count: { countOf: { subtype: "Cleric", controlledBy: "you" } } } },
        may: true,
      },
      text: TEXT,
    },
  ],
});
