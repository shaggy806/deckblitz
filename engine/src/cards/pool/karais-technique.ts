import { defineCard } from "../define.js";

// EDHREC rank 17620.

export default defineCard({
  name: "Karai's Technique",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  sneak: { cost: "{W}{B}" },
  text: "Sneak {W}{B} (You may cast this spell for {W}{B} if you also return an unblocked attacker you control to hand during the declare blockers step.)\nChoose one or both —\n• Target creature gets +3/+3 until end of turn.\n• Target creature gets -3/-3 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Target creature gets +3/+3 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      },
      {
        text: "Target creature gets -3/-3 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      },
    ],
  },
});
