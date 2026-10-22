import { defineCard } from "../define.js";

// EDHREC rank 19859. Ixalan. Both targets are required to cast it; if one
// becomes illegal, the other is still affected (the rulings) — one step per
// target slot.
export default defineCard({
  name: "Skulduggery",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Until end of turn, target creature you control gets +1/+1 and target creature an opponent controls gets -1/-1.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: -1, toughness: -1, duration: "end-of-turn" },
    ],
  },
});
