import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const TEXT =
  "When T'Pol enters, tap target creature an opponent controls and put two stun counters on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "T'Pol, Vulcan Representative",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vulcan", "Scientist"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
