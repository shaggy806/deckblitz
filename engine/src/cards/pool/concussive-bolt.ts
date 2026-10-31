import { defineCard } from "../define.js";

// "Creatures controlled by that player or by that planeswalker's controller
// can't block this turn": a turn-wide rule (rule 611.2c) over the creatures of
// whoever the target is or controls — `restrict`'s `controlledByTarget`.
const TEXT =
  "Concussive Bolt deals 4 damage to target player or planeswalker.\nMetalcraft — If you control three or more artifacts, creatures controlled by that player or by that planeswalker's controller can't block this turn.";

export default defineCard({
  name: "Concussive Bolt",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "metalcraft" },
        then: {
          kind: "restrict",
          filter: { type: "creature", controlledBy: "you" },
          controlledByTarget: 0,
          restrictions: ["cant-block"],
        },
      },
    ],
  },
});
