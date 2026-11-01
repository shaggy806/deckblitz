import { defineCard } from "../define.js";

// One delayed ability over both targets, either of which may have left by
// then; only what those creatures blocked, not what blocked them.

const THEN = "Tap each creature that was blocked by one of those creatures this turn and it doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Triton Tactics",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Up to two target creatures each get +0/+3 until end of turn. Untap those creatures. At this turn's next end of combat, tap each creature that was blocked by one of those creatures this turn and it doesn't untap during its controller's next untap step.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 0, toughness: 3, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 0, toughness: 3, duration: "end-of-turn" },
      { kind: "untap", target: 0 },
      { kind: "untap", target: 1 },
      {
        kind: "delayed-trigger",
        at: "end-of-combat-this-turn",
        effect: {
          kind: "tap-all",
          filter: { type: "creature", blockedThisTurn: { relation: "blocked-by", of: "each-target" } },
          doesntUntapNext: true,
        },
        text: THEN,
      },
    ],
  },
});
