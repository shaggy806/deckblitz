import { defineCard } from "../define.js";

// The exiled card returns the moment Cast Out leaves, with nothing in between
// (the ruling — rule 610.3, `untilSourceLeaves`).
const EXILE_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Cast Out",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  cycling: { cost: "{W}" },
  text: `Flash\n${EXILE_TEXT}\nCycling {W} ({W}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
