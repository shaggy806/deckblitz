import { defineCard } from "../define.js";

// "Other creatures that player controls can't block this turn": a turn-wide
// rule over the target creature's controller's creatures (rule 611.2c),
// leaving the target out — `restrict`'s `controlledByTarget` and
// `exceptTarget`.
const TEXT =
  "Target creature an opponent controls blocks this turn if able. Untap that creature. Other creatures that player controls can't block this turn.";

export default defineCard({
  name: "Mark for Death",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "opponent" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "block-if-able", target: 0 },
      { kind: "untap", target: 0 },
      {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 0,
        exceptTarget: 0,
        restrictions: ["cant-block"],
      },
    ],
  },
});
