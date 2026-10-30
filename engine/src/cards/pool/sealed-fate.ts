import { defineCard } from "../define.js";

// EDHREC rank 29681.

export default defineCard({
  name: "Sealed Fate",
  manaCost: "{X}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Look at the top X cards of target opponent's library. Exile one of those cards and put the rest back on top of that player's library in any order.",
  targets: ["opponent"],
  effect: {
    kind: "look-and-choose",
    from: { target: 0 },
    zone: "library",
    count: "x",
    min: 1,
    max: 1,
    destination: "exile",
    unlinked: true,
    leftover: "top-any-order",
  },
});
