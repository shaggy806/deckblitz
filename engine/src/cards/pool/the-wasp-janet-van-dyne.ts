import { defineCard } from "../define.js";

// EDHREC rank 27469.

export default defineCard({
  name: "The Wasp, Janet Van Dyne",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nWhen The Wasp enters, she deals 4 damage to target tapped creature an opponent controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", tapped: true } }],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "When The Wasp enters, she deals 4 damage to target tapped creature an opponent controls.",
    },
  ],
});
