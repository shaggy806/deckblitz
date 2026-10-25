import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 27343.
//
// If the opponent's creature is gone by resolution, yours still gets +2/+2 and nothing fights
// (the ruling).

export default defineCard({
  name: "Wild Instincts",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control gets +2/+2 until end of turn. It fights target creature an opponent controls. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
