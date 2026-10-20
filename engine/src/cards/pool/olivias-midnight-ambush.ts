import { defineCard } from "../define.js";

// EDHREC rank 27077. "If it's night" is read as the spell resolves.

export default defineCard({
  name: "Olivia's Midnight Ambush",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -2/-2 until end of turn. If it's night, that creature gets -13/-13 until end of turn instead.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "day-night", is: "night" },
    then: { kind: "modify-pt", target: 0, power: -13, toughness: -13, duration: "end-of-turn" },
    else: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
  },
});
