import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 22949.
//
// Not modal (the ruling): one slot that takes a land or a nonblack creature,
// checked again as it resolves.

export default defineCard({
  name: "Befoul",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target land or nonblack creature. It can't be regenerated.",
  targets: [
    {
      kind: "permanent",
      filter: { anyOf: [{ type: "land" }, { type: "creature", notColors: ["B"] }] },
    },
  ],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
