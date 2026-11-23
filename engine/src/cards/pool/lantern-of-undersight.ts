import { defineCard } from "../define.js";

// Playtest card. River Song's Meet in Reverse (`drawsFromBottom`): only draws
// change — "the top card of your library" still means the top (the ruling).

const TEXT = "You draw cards from the bottom of your library instead of the top of your library.";

export default defineCard({
  name: "Lantern of Undersight",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, drawsFromBottom: "you", text: TEXT }],
});
