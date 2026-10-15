import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 15850.
//
// Rulings:
//   [2025-07-25] The effect of Atomic Microsizer's second ability will overwrite any previous
//     effects that set the creature's power and toughness to specific values. Effects that
//     otherwise modify the target creature's power and toughness will still apply no matter when
//     they took effect. The same is true for +1/+1 counters.
//
// "Has base power and toughness 1/1" is a layer-7b set (Perfected Theory's
// `animate` with no new types), so counters and bonuses still apply over it.
// Any creature, either side's: up to one, so the slot may be declined.

const ATTACK_TEXT =
  "Whenever equipped creature attacks, choose up to one target creature. That creature can't be blocked this turn and has base power and toughness 1/1 until end of turn.";

export default defineCard({
  name: "Atomic Microsizer",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+0.\n${ATTACK_TEXT}\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          {
            kind: "animate",
            target: 0,
            power: 1,
            toughness: 1,
            addTypes: [],
            addSubtypes: [],
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
