import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 19205.
//
// Once per life-gaining event, however much (its rulings). The loyalty
// counter is no loyalty ability: it activates nothing.

const LIFE_TEXT = "Whenever you gain life, put two +1/+1 counters on this creature.";
const LOYALTY_TEXT = "{3}{W}: Put a loyalty counter on target Gideon planeswalker.";

export default defineCard({
  name: "Gideon's Company",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${LIFE_TEXT}\n${LOYALTY_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "planeswalker", subtype: "Gideon" } }],
      effect: { kind: "add-counter", target: 0, counter: "loyalty", amount: 1 },
      resolve: null,
      text: LOYALTY_TEXT,
    },
  ],
});
