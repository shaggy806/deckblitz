import { defineCard } from "../define.js";

// EDHREC rank 11554. The −7 is a one-shot grant: it reaches the creatures you
// control as it resolves (rule 611.2c), and lasts the turn even if Jace has
// left (the ruling).

export default defineCard({
  name: "Jace, Arcane Strategist",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 4,
  text: "Whenever you draw your second card each turn, put a +1/+1 counter on target creature you control.\n+1: Draw a card.\n−7: Creatures you control can't be blocked this turn.",
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you draw your second card each turn, put a +1/+1 counter on target creature you control.",
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "+1: Draw a card.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      // A rule for the rest of the turn, not a grant (rule 611.2c): a creature
      // that comes under your control later this turn can't be blocked either.
      effect: { kind: "restrict", filter: { type: "creature", controlledBy: "you" }, restrictions: ["cant-be-blocked"] },
      resolve: null,
      text: "−7: Creatures you control can't be blocked this turn.",
    },
  ],
});
