import { defineCard } from "../define.js";

// "Creatures can't be blocked this turn" from exile, as the last time counter
// comes off (`whileSuspended`): a turn-wide rule (rule 611.2c), so the
// Oddity itself, cast by suspend right after, is bound too.
const SUSPEND_TEXT = "Suspend 4—{1}{U}";
const TRIGGER_TEXT =
  "When the last time counter is removed from this card while it's exiled, creatures can't be blocked this turn.";

export default defineCard({
  name: "Veiling Oddity",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 3,
  text: `${SUSPEND_TEXT}\n${TRIGGER_TEXT}`,
  suspend: { n: 4, cost: "{1}{U}" },
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "time", last: true },
      whileSuspended: true,
      targets: [],
      effect: { kind: "restrict", filter: { type: "creature" }, restrictions: ["cant-be-blocked"] },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
