import { defineCard } from "../define.js";
import type { Keyword } from "../define.js";
import type { ModeOption } from "../../effects.js";

// EDHREC rank 22975. Tempest.
//
// Rulings:
//   [2004-10-04] If the target which is having the ability removed does not have that ability
//     during the resolution of this effect, then this effect still grants the chosen ability. The
//     reason is that the second target is still legal even if the first one is not.

/** One option of the cost's choice: its own two targets (the second other than the first). */
function splice(keyword: Keyword, name: string): ModeOption {
  return {
    // The offer reads "{2}, {T}, Choose …: <this>", one offer per keyword.
    text: `Until end of turn, target creature with ${name} loses ${name} and another target creature gains ${name}.`,
    targets: [
      { kind: "permanent", filter: { type: "creature", keyword } },
      { kind: "other", of: "creature", than: { slot: 0 } },
    ],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "become", target: 0, loseKeywords: [keyword], duration: "end-of-turn" },
        { kind: "grant-keyword", target: 1, keyword, duration: "end-of-turn" },
      ],
    },
  };
}

export default defineCard({
  name: "Phyrexian Splicer",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}, Choose flying, first strike, trample, or shadow: Until end of turn, target creature with the chosen ability loses it and another target creature gains it.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      // The keyword is chosen as part of the cost, as it's activated and before its targets
      // (rules 602.2b, 601.2b); the ability isn't modal (700.2).
      effect: {
        kind: "modal",
        announced: true,
        costChoice: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          splice("flying", "flying"),
          splice("first-strike", "first strike"),
          splice("trample", "trample"),
          splice("shadow", "shadow"),
        ],
      },
      resolve: null,
      text: "{2}, {T}, Choose flying, first strike, trample, or shadow: Until end of turn, target creature with the chosen ability loses it and another target creature gains it.",
    },
  ],
});
