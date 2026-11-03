import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 31822.
const TEXT =
  "{R}: This creature gets +2/+0 until end of turn. Activate only during the declare blockers step, only if at least one creature is blocking this creature, and only once each turn.";

export default defineCard({
  name: "Grizzled Wolverine",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolverine"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", steps: ["declare-blockers"] },
          { kind: "source", filter: { blockerCount: { op: "gte", n: 1 } } },
        ],
      },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
