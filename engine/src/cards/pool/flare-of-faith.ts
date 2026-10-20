import { defineCard } from "../define.js";

// EDHREC rank 12864. "If it's a Human, instead …" reads the target as the
// spell resolves (Porcelain Zealot's shape).

export default defineCard({
  name: "Flare of Faith",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If it's a Human, instead it gets +3/+3 and gains indestructible until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { subtype: "Human" } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      ],
    },
    else: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  },
});
