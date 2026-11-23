import { defineCard } from "../define.js";

// Playtest card. Each mode is the named card's effect, the parenthetical its summary: Idyllic Tutor,
// Revoke Existence and Reprisal as the pool authors them.

const TUTOR = "Idyllic Tutor (Search for an enchantment.)";
const REVOKE = "Revoke Existence (Exile an artifact or enchantment.)";
const REPRISAL = "Reprisal (Destroy a creature with power 4 or greater. It can't be regenerated.)";

export default defineCard({
  name: "Theros Charm",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose one —\n• ${TUTOR}\n• ${REVOKE}\n• ${REPRISAL}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: TUTOR,
        targets: [],
        effect: {
          kind: "search-library",
          filter: { type: "enchantment" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      {
        text: REVOKE,
        targets: ["artifact-or-enchantment"],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: REPRISAL,
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
        effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      },
    ],
  },
});
