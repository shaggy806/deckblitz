import { defineCard } from "../define.js";
import { ravenous } from "../helpers.js";

// EDHREC rank 7310.
//
// Ravenous is the `ravenous()` helper (Jacked Rabbit). The barrage reads the X
// the spell was cast with (rule 107.3m, the ravenous rulings) — 0 when it
// entered any other way — and its damage to the players and the other
// creatures is one event (Chandra's Ignition's simultaneous sequence).
const RAVENOUS = ravenous();
const BARRAGE_TEXT =
  "Bio-plasmic Barrage — When this creature enters, it deals X damage to each player and each other creature.";

export default defineCard({
  name: "Exocrine",
  manaCost: "{X}{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 2,
  toughness: 2,
  text:
    "Ravenous (This creature enters with X +1/+1 counters on it. If X is 5 or more, draw a card when it enters.)\n" +
    BARRAGE_TEXT,
  static: [RAVENOUS.static],
  triggered: [
    RAVENOUS.triggered,
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: "x", who: "each-player" },
          { kind: "damage-all", filter: { type: "creature" }, amount: "x", exceptSource: true },
        ],
      },
      resolve: null,
      text: BARRAGE_TEXT,
    },
  ],
});
