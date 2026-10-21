import { defineCard } from "../define.js";

// EDHREC rank 24489.
const CAST_TEXT = "Whenever you cast a multicolored spell, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Rampaging Monument",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Cleric"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\nThis creature enters with three +1/+1 counters on it.\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "This creature enters with three +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
