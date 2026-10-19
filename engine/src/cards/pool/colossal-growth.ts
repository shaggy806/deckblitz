import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 14997.
//
// "Instead" when kicked: the kicked effect replaces the unkicked one whole —
// +4/+4, trample and haste, never +3/+3 on top.
export default defineCard({
  name: "Colossal Growth",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker {R} (You may pay an additional {R} as you cast this spell.)\nTarget creature gets +3/+3 until end of turn. If this spell was kicked, instead that creature gets +4/+4 and gains trample and haste until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
  kicker: {
    cost: "{R}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      ],
    },
  },
});
