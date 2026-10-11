import { defineCard } from "../define.js";

// "Target player" — you may point this at yourself, which is most of why the
// card is played, so the spec is `"player"` rather than `"opponent"`.
export default defineCard({
  name: "Sign in Blood",
  // Pinned: Scryfall answers "Sign in Blood" by name with Scheming Silvertongue // Sign in Blood, whose
  // prepare spell or adventure shares the name.
  art: "b89d9372-8682-4a61-a003-8bccfbb6cbb4",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player draws two cards and loses 2 life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, target: 0 },
      { kind: "lose-life", amount: 2, target: 0 },
    ],
  },
});
