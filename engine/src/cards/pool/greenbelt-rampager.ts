import { defineCard } from "../define.js";

// "Pay {E}{E}. If you can't, …": no choice, you pay whenever you're able.

const TEXT = "When this creature enters, pay {E}{E} (two energy counters). If you can't, return this creature to its owner's hand and you get {E}.";

export default defineCard({
  name: "Greenbelt Rampager",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "player-counters", counter: "energy", who: "you", atLeast: 2 },
        then: { kind: "pay-energy", amount: 2 },
        else: {
          kind: "sequence",
          effects: [
            { kind: "return-to-hand", target: "source" },
            { kind: "get-energy", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
