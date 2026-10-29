import { defineCard } from "../define.js";

// EDHREC rank 14785. Switcheroo's exchange over nonlegendary creatures (rule
// 701.12b — nothing happens if one player controls both, or if either target
// is illegal as it resolves); "can't activate during combat" is the negation
// of the turn-structure condition.

const TEXT = "{T}: Exchange control of two target nonlegendary creatures. You can't activate this ability during combat.";

const nonlegendary = { kind: "permanent", filter: { type: "creature", notSupertype: "legendary" } } as const;

export default defineCard({
  name: "Djinn of Infinite Deceits",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 2,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [nonlegendary, { kind: "other", of: nonlegendary, than: { slot: 0 } }],
      effect: { kind: "exchange-control", objects: [0, 1] },
      resolve: null,
      text: TEXT,
      condition: { kind: "not", of: { kind: "turn-structure", duringCombat: true } },
    },
  ],
});
