import { defineCard } from "../define.js";

// EDHREC rank 28425.

export default defineCard({
  name: "Mockingbird, Bobbi Morse",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 3,
  text: "Whenever Mockingbird is dealt damage, put a +1/+1 counter on her. (She must survive the damage to get the counter.)",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever Mockingbird is dealt damage, put a +1/+1 counter on her.",
    },
  ],
});
