import { defineCard } from "../define.js";

// EDHREC rank 23773.
//
// Its colour is read as the spell resolves (Tragic Slip's either-or shape).

export default defineCard({
  name: "Ray of Enfeeblement",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -4/-1 until end of turn. If that creature is white, it gets -4/-4 until end of turn instead.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { colors: ["W"] } },
    then: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
    else: { kind: "modify-pt", target: 0, power: -4, toughness: -1, duration: "end-of-turn" },
  },
});
