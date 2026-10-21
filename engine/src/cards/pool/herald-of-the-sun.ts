import { defineCard } from "../define.js";

export default defineCard({
  name: "Herald of the Sun",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{3}{W}: Put a +1/+1 counter on another target creature with flying.",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", keyword: "flying" } } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{3}{W}: Put a +1/+1 counter on another target creature with flying.",
    },
  ],
});
