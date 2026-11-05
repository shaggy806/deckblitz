import { defineCard } from "../define.js";

// EDHREC rank 27541.

export default defineCard({
  name: "Eye Spy",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top card of target player's library. You may put that card into their graveyard.",
  targets: ["player"],
  effect: {
    kind: "look-and-choose",
    from: { target: 0 },
    zone: "library",
    count: 1,
    min: 0,
    max: 1,
    destination: "graveyard",
    leftover: "stay",
  },
});
