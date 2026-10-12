import { defineCard } from "../define.js";

// EDHREC rank 9441.

// Banishing Light's O-Ring, with its return half.
const ENTER_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Web Up",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this enchantment leaves the battlefield, return the exiled card.",
    },
  ],
});
