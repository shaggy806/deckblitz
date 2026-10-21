import { defineCard } from "../define.js";

const TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";

// Banishing Light's shape: gone before the trigger resolves, nothing is
// exiled (the ruling); an exiled token ceases to exist.
export default defineCard({
  name: "Hieromancer's Cage",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
