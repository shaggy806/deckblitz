import { defineCard } from "../define.js";

// Rulings: the Frog's own combat damage isn't prevented, every other
// creature's is — those arriving after the ability resolves included (the
// filter is asked as the damage would be dealt, rule 615.1) — and two Frogs
// entering in one turn prevent each other's.

export default defineCard({
  name: "Haze Frog",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nWhen this creature enters, prevent all combat damage that other creatures would deal this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-rule", by: { filter: { type: "creature" }, exceptTarget: "source" }, combat: true },
      resolve: null,
      text: "When this creature enters, prevent all combat damage that other creatures would deal this turn.",
    },
  ],
});
