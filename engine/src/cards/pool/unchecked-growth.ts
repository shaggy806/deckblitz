import { defineCard } from "../define.js";

export default defineCard({
  name: "Unchecked Growth",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Target creature gets +4/+4 until end of turn. If it's a Spirit, it gains trample until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Spirit" } },
        then: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      },
    ],
  },
});
