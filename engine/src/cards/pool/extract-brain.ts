import { defineCard } from "../define.js";

// EDHREC rank 8717.
//
// - The target opponent chooses X cards from their hand, all of them with X
//   or fewer (rule 609.3), you seeing nothing of the choice; then you look at
//   those cards alone (`look-at-hand`'s `only`), the rest of the hand staying
//   hidden (rule 400.2); then you may cast one spell from among them, free,
//   as this resolves, whatever its type's timing (rule 608.2g).
const TEXT =
  "Target opponent chooses X cards from their hand. Look at those cards. You may cast a spell from among them without paying its mana cost.";

export default defineCard({
  name: "Extract Brain",
  manaCost: "{X}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: "x",
          max: "x",
          destination: "stay",
          leftover: "stay",
          prompt: "Choose cards from your hand for your opponent to look at — they may cast a spell from among them",
        },
      },
      { kind: "look-at-hand", target: 0, only: "chosen-this-way" },
      { kind: "cast-now", from: "chosen-this-way", free: true },
    ],
  },
});
