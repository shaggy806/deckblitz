import { defineCard } from "../define.js";

// Gonti, Lord of Luxury's look, but "play": a land too (the ruling). Only the
// caster may look at the face-down card.
export default defineCard({
  name: "Siphon Insight",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  flashback: { cost: "{1}{U}{B}" },
  text: "Look at the top two cards of target opponent's library. Exile one of them face down and put the other on the bottom of that library. You may play the exiled card for as long as it remains exiled, and you may spend mana as though it were mana of any color to cast that spell.\nFlashback {1}{U}{B}",
  targets: ["opponent"],
  effect: {
    kind: "look-and-choose",
    from: { target: 0 },
    zone: "library",
    count: 2,
    min: 1,
    max: 1,
    destination: "exile-face-down",
    unlinked: true,
    playable: { duration: "while-exiled", spendAs: "any-color" },
    leftover: "bottom-any-order",
  },
});
