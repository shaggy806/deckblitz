import { defineCard } from "../define.js";

// Ajani, Sleeper Agent's distribution: at most two targets, each assigned at
// least one counter, and none at all allowed (the rulings).
const DISTRIBUTE_TEXT = "+1: Distribute two +1/+1 counters among up to two target creatures. They gain trample until end of turn.";
const BITE_TEXT = "−3: Target creature you control deals damage equal to its power to target creature or planeswalker.";
const WISH_TEXT = "−5: You may reveal a creature card you own from outside the game and put it into your hand.";

export default defineCard({
  name: "Vivien, Arkbow Ranger",
  manaCost: "{1}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vivien"],
  loyalty: 4,
  text: `${DISTRIBUTE_TEXT}\n${BITE_TEXT}\n${WISH_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "creature", min: 0, max: 2 }],
      divided: { total: 2, slot: 0, of: "+1/+1 counters" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "counters-divided", from: 0, counter: "+1/+1" },
          {
            kind: "for-each-target",
            from: 0,
            effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: DISTRIBUTE_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature-you-control", { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "fight", a: 0, b: 1, oneSided: true },
      resolve: null,
      text: BITE_TEXT,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "creature" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
        outside: "only",
      },
      resolve: null,
      text: WISH_TEXT,
    },
  ],
});
