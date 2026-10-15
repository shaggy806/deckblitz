import { defineCard } from "../define.js";

// EDHREC rank 11275. "If that creature is an Ally" is read as the spell
// resolves, of the creature as it is then.

export default defineCard({
  name: "Yip Yip!",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "Target creature you control gets +2/+2 until end of turn. If that creature is an Ally, it also gains flying until end of turn.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Ally" } },
        then: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      },
    ],
  },
});
