import { defineCard } from "../define.js";
import { ravenous } from "../helpers.js";

const RAVENOUS = ravenous();
const BROOD_TEXT =
  "Brood Telepathy — When this creature enters, distribute X +1/+1 counters among any number of other target creatures you control.";

// X is the X it was cast with (rule 107.3m), the total announced as the
// trigger is put on the stack (603.3d, 601.2d — its ruling).
export default defineCard({
  name: "Broodlord",
  manaCost: "{X}{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 3,
  toughness: 3,
  text:
    "Ravenous (This creature enters with X +1/+1 counters on it. If X is 5 or more, draw a card when it enters.)\n" + BROOD_TEXT,
  static: [RAVENOUS.static],
  triggered: [
    RAVENOUS.triggered,
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "other", of: "creature-you-control" } }],
      divided: { total: "x", slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: BROOD_TEXT,
    },
  ],
});
