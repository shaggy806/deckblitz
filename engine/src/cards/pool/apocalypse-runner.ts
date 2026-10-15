import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 20456.
//
// Rulings:
//   [2025-02-07] Once a creature has been blocked, activating this Vehicle's first ability
//     targeting that creature won't cause it to become unblocked.
//   [2025-02-07] After the first ability has resolved targeting a creature, that creature has
//     lifelink and can't be blocked for the rest of the turn, even if its power increases to 3 or
//     greater.
//
// The power limit is the target's legality only; what it gains lasts the turn
// whatever its power becomes (the second ruling).

const TAP_TEXT =
  "{T}: Target creature you control with power 2 or less gains lifelink until end of turn and can't be blocked this turn.";

export default defineCard({
  name: "Apocalypse Runner",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 5,
  text: `${TAP_TEXT}\nCrew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
    crew(3),
  ],
});
