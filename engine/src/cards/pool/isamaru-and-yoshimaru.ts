import { defineCard } from "../define.js";

// A playtest card (Mystery Booster 2).

export default defineCard({
  name: "Isamaru and Yoshimaru",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: "Whenever another legendary creature or creature with mana value one enters the battlefield under your control, put a +1/+1 counter on Isamaru and Yoshimaru.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: {
          type: "creature",
          anyOf: [{ supertype: "legendary" }, { manaValue: { op: "eq", n: 1 } }],
        },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever another legendary creature or creature with mana value one enters the battlefield under your control, put a +1/+1 counter on Isamaru and Yoshimaru.",
    },
  ],
});
