import { defineCard } from "../define.js";
import { undying } from "../helpers.js";

// EDHREC rank 12229.
//
// Rulings:
//   [2023-11-03] Use the power of the Wraiths as the triggered ability resolves to determine the
//     value of X. If one or more of those Wraiths are no longer on the battlefield at that time,
//     use their power from when they were last on the battlefield.
// "Their total power" is a sum over the trigger's batch (the Wraiths that
// attacked), each read as it is on resolution or as it last existed once it
// has left (rule 608.2h) — Vulpine Harvester's shape.
const ATTACK_TEXT =
  "Whenever you attack with one or more Wraiths, exile the top X cards of your library, where X is their total power. You may play those cards this turn.";

export default defineCard({
  name: "Witch-king, Sky Scourge",
  manaCost: "{5}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Wraith", "Noble"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\nUndying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { subtype: "Wraith" } },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: { aggregate: "sum", of: "power", filter: {}, in: "trigger-batch" },
        duration: "end-of-turn",
        play: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    undying(),
  ],
});
