import { defineCard } from "../define.js";

// EDHREC rank 9177.

export default defineCard({
  name: "Leonardo, Cutting Edge",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  sneak: { cost: "{W}" },
  text: "Sneak {W} (You may cast this spell for {W} if you also return an unblocked attacker you control to hand during the declare blockers step. He enters tapped and attacking.)\nLifelink\nWhenever you gain life, put a +1/+1 counter on Leonardo.",
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you gain life, put a +1/+1 counter on Leonardo.",
    },
  ],
});
