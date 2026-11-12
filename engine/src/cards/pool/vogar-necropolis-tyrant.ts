import { defineCard } from "../define.js";

// EDHREC rank 13725. "During your turn" is part of the trigger event
// (Starfleet Security's shape).

export default defineCard({
  name: "Vogar, Necropolis Tyrant",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: "Menace\nWhenever another creature dies during your turn, put a +1/+1 counter on Vogar.\nWhen Vogar dies, draw a card for each +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever another creature dies during your turn, put a +1/+1 counter on Vogar.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: "When Vogar dies, draw a card for each +1/+1 counter on it.",
    },
  ],
});
