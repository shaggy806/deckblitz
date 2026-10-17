import { defineCard } from "../define.js";

// The granted dies trigger rides on the creature until end of turn (Feign
// Death's `grant-triggered`), and fires off its last-known abilities as it dies.

const GRANTED_TEXT =
  "When this creature dies, reveal cards from the top of your library until you reveal a Time Lord creature card. Put that card onto the battlefield and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Time Lord Regeneration",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Until end of turn, target Time Lord you control gains "${GRANTED_TEXT}"`,
  targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Time Lord" } }],
  effect: {
    kind: "grant-triggered",
    target: 0,
    duration: "end-of-turn",
    ability: {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { type: "creature", subtype: "Time Lord" },
        put: "battlefield",
        rest: "bottom-random",
      },
      resolve: null,
      text: GRANTED_TEXT,
    },
  },
});
