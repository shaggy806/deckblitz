import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// - "Whenever you remove": only a removal by its owner — suspend's own upkeep
//   trigger, a spell or ability they control (Dust of Moments' two fire it
//   twice), a cost they paid — not an opponent's Clockspinning
//   (`counters-removed`'s `byYou` and `perCounter`).

const SURVEIL_TEXT = "Whenever you remove a time counter from this card while it's exiled, surveil 1.";

export default defineCard({
  name: "Watcher of Hours",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying, ward {3}\n${SURVEIL_TEXT}\nSuspend 6—{1}{U} (Rather than cast this card from your hand, you may pay {1}{U} and exile it with six time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)`,
  suspend: { n: 6, cost: "{1}{U}" },
  triggered: [
    ward({ mana: "{3}" }),
    {
      trigger: { on: "counters-removed", who: "self", counter: "time", perCounter: true, byYou: true },
      whileSuspended: true,
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
