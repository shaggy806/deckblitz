import { defineCard } from "../define.js";

const ATTACKED_OR_BLOCKED = {
  type: "creature",
  anyOf: [{ attackedThisTurn: true }, { blockedThisTurn: { relation: "blocked" } }],
} as const;

export default defineCard({
  name: "Gideon's Triumph",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Target opponent sacrifices a creature of their choice that attacked or blocked this turn. If you control a Gideon planeswalker, that player sacrifices two of those creatures of their choice instead.",
  targets: ["opponent"],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Gideon" }, atLeast: 1 },
    then: { kind: "sacrifice", who: "target", filter: ATTACKED_OR_BLOCKED, count: 2 },
    else: { kind: "sacrifice", who: "target", filter: ATTACKED_OR_BLOCKED, count: 1 },
  },
});
