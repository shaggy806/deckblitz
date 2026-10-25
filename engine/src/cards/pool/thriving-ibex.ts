import { defineCard } from "../define.js";

// EDHREC rank 27628. Scrapper Champion's attack trigger.

export default defineCard({
  name: "Thriving Ibex",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Goat"],
  power: 2,
  toughness: 4,
  text: "When this creature enters, you get {E}{E} (two energy counters).\nWhenever this creature attacks, you may pay {E}{E}. If you do, put a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: "When this creature enters, you get {E}{E}.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to put a +1/+1 counter on this creature?",
        costEnergy: 2,
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Whenever this creature attacks, you may pay {E}{E}. If you do, put a +1/+1 counter on it.",
    },
  ],
});
