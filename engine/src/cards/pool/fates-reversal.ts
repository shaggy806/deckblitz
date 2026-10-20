import { defineCard } from "../define.js";

// EDHREC rank 11919.
export default defineCard({
  name: "Fates' Reversal",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return up to one target creature card from your graveyard to your hand. Venture into the dungeon. (Enter the first room or advance to the next room.)",
  targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "venture" },
    ],
  },
});
