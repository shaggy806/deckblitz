import { defineCard } from "../define.js";

// EDHREC rank 23867.
//
// Two "target" words, so a land creature may be both targets (the ruling);
// both are exiled as one event (`simultaneous`).
const TEXT = "Exile target creature and target land.";

export default defineCard({
  name: "Grip of Desolation",
  manaCost: "{4}{B}{B}",
  colors: [],
  types: ["instant"],
  text: `Devoid (This card has no color.)\n${TEXT}`,
  targets: ["creature", "land"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "exile", target: 0 },
      { kind: "exile", target: 1 },
    ],
  },
});
