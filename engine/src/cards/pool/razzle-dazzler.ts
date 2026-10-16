import { defineCard } from "../define.js";

// EDHREC rank 15137.
//
// Spells cast before it entered count toward "your second spell" (the
// ruling — `nthEachTurn`). "Can't be blocked this turn" is the `unblockable`
// keyword until end of turn; already blocked, it stays blocked (the ruling,
// rule 509.1h).
const TEXT =
  "Whenever you cast your second spell each turn, put a +1/+1 counter on this creature. It can't be blocked this turn.";

export default defineCard({
  name: "Razzle-Dazzler",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
