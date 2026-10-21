import { defineCard } from "../define.js";

// EDHREC rank 20714.
//
// Rulings:
//   You choose the target as the ability goes on the stack, but whether they
//   fight as it resolves. If Affectionate Indrik is gone by then, the target
//   neither deals nor is dealt damage.

export default defineCard({
  name: "Affectionate Indrik",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, you may have it fight target creature you don't control. (Each deals damage equal to its power to the other.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "may",
        prompt: "Have Affectionate Indrik fight the target creature?",
        effect: { kind: "fight", a: "source", b: 0 },
      },
      resolve: null,
      text: "When this creature enters, you may have it fight target creature you don't control.",
    },
  ],
});
