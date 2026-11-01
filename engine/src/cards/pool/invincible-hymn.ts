import { defineCard } from "../define.js";

// Shards of Alara (ALA).
//
// The library is counted once, as it resolves.

const TEXT = "Count the number of cards in your library. Your life total becomes that number.";

export default defineCard({
  name: "Invincible Hymn",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: { kind: "set-life-total", who: "you", amount: { librarySize: "you" } },
});
