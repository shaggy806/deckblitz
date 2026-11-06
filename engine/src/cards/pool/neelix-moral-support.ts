import { defineCard } from "../define.js";

// EDHREC rank 32673.
// Makes Food → use "Food Token".

export default defineCard({
  name: "Neelix, Moral Support",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Talaxian", "Advisor"],
  power: 1,
  toughness: 1,
  text: "When Neelix enters, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nWhenever you gain life, put a +1/+1 counter on Neelix.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "When Neelix enters, create a Food token.",
    },
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you gain life, put a +1/+1 counter on Neelix.",
    },
  ],
});
