import { defineCard } from "../define.js";

// EDHREC rank 23651. Secrets of Strixhaven.
//
// The counter goes on before the spell resolves, even if it's countered (the
// ruling).
const CAST_TEXT = "Whenever you cast a multicolored spell, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Mage Tower Referee",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 1,
  text: CAST_TEXT,
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
