import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 14029.

const STOWAGE_TEXT =
  "Stowage — Whenever this Vehicle attacks, put two +1/+1 counters on another target attacking creature.";

export default defineCard({
  name: "Goliath Truck",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: `${STOWAGE_TEXT}\n${crewText(2)}`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: STOWAGE_TEXT,
    },
  ],
});
