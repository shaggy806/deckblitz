import { defineCard } from "../define.js";

// EDHREC rank 23196.
//
// A turn-long delayed trigger (rule 603.7): each attacking creature that deals
// combat damage to you deals that much to its controller, from itself (so its
// lifelink, deathtouch and the like apply) — as it last existed if it has left
// the battlefield by then.

export default defineCard({
  name: "Harsh Justice",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nThis turn, whenever an attacking creature deals combat damage to you, it deals that much damage to its controller.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: {
      whenever: {
        on: "deals-damage",
        who: "any",
        filter: { type: "creature", attacking: true },
        to: "you",
        combat: true,
      },
    },
    effect: { kind: "damage", amount: { triggerValue: true }, who: "trigger-controller", from: "trigger-object" },
    text: "Whenever an attacking creature deals combat damage to you this turn, it deals that much damage to its controller.",
  },
});
