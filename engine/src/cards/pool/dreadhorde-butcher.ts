import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 13174.
//
// "A player or planeswalker" is Psychic Frog's two halves, one per kind of
// recipient. The dies trigger reads its power as it last existed (its
// ruling): 0 or less deals nothing.

const COUNTER_TEXT =
  "Whenever this creature deals combat damage to a player or planeswalker, put a +1/+1 counter on this creature.";
const DIES_TEXT = "When this creature dies, it deals damage equal to its power to any target.";

export default defineCard({
  name: "Dreadhorde Butcher",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${COUNTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player", combat: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "planeswalker", combat: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
