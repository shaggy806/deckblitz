import { defineCard } from "../define.js";

// EDHREC rank 28347.
//
// Rulings:
//   [2013-01-24] Incursion Specialist's ability can trigger only once each turn. The ability will
//     resolve before the second spell resolves. It doesn't matter if the first spell you cast that
//     turn has resolved, was countered, or is still on the stack.

const TEXT =
  "Whenever you cast your second spell each turn, this creature gets +2/+0 until end of turn and can't be blocked this turn.";

export default defineCard({
  name: "Incursion Specialist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
