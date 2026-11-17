import { defineCard } from "../define.js";

// EDHREC rank 11181. The granted trigger's "only once each turn" is kept per
// grant — this Wombat in this stint — not by where it sits in the permanent's
// list (the rulings: two Wombats grant two abilities, each once a turn, and a
// new Wombat grants a new one even to a permanent the old one's has already
// triggered for). It grants to itself too, and to permanents without P/T.

const GRANTED_TEXT =
  "Whenever one or more +1/+1 counters are put on this permanent, put an additional +1/+1 counter on it. This ability triggers only once each turn.";
const STATIC_TEXT = `Permanents you control have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Cursed Wombat",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Nightmare", "Wombat"],
  power: 2,
  toughness: 3,
  text: `{2}{B}{G}: Adapt 2. (If this creature has no +1/+1 counters on it, put two +1/+1 counters on it.)\n${STATIC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}{G}", tap: false },
      targets: [],
      effect: { kind: "adapt", amount: 2 },
      resolve: null,
      text: "{2}{B}{G}: Adapt 2.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          oncePerTurn: true,
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
