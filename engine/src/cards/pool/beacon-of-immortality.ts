import { defineCard } from "../define.js";

// "Your life total becomes" read by the target player: 119.5's gain or loss of
// the difference, so a negative total goes further down (the ruling).
const TEXT = "Double target player's life total. Shuffle Beacon of Immortality into its owner's library.";

export default defineCard({
  name: "Beacon of Immortality",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "as-player",
    who: { target: 0 },
    effect: { kind: "set-life-total", who: "you", amount: { product: [{ lifeTotal: "you" }, 2] } },
  },
  shuffleIntoLibraryOnResolve: true,
});
