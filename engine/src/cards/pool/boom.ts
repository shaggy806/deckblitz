import { defineCard } from "../define.js";

const FACES = ["Boom // Bust", "Boom", "Bust"];

// The left half of Boom // Bust (see boom-bust.ts). One instruction over two
// targets, so the two lands are destroyed as one event; if one target is
// illegal the other is still destroyed (the ruling).
export default defineCard({
  name: "Boom",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land you control and target land you don't control.",
  targets: ["land-you-control", { kind: "permanent", whose: "opponent", filter: { type: "land" } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "destroy", target: 1 },
    ],
  },
  faces: FACES,
  split: true,
});
