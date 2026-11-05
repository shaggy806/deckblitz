import { defineCard } from "../define.js";
import { CHOSEN_COUNTER } from "../../effects.js";

const TAPPED_CREATURE = { kind: "permanent", filter: { type: "creature", tapped: true } } as const;

export default defineCard({
  name: "The Caves of Androzani",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\nI — Put two stun counters on each of up to two target tapped creatures.\nII, III — For each non-Saga permanent, choose a counter on it. You may put an additional counter of that kind on that permanent.\nIV — Search your library for a Doctor card, reveal it, put it into your hand, then shuffle.",
  chapters: [
    {
      at: [1],
      targets: [
        { kind: "optional", of: TAPPED_CREATURE },
        { kind: "optional", of: { kind: "other", of: TAPPED_CREATURE, than: { slot: 0 } } },
      ],
      effect: {
        kind: "sequence",
        together: true,
        effects: [
          { kind: "add-counter", target: 0, counter: "stun", amount: 2 },
          { kind: "add-counter", target: 1, counter: "stun", amount: 2 },
        ],
      },
      resolve: null,
      text: "I — Put two stun counters on each of up to two target tapped creatures.",
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { notSubtypes: ["Saga"] },
        effect: {
          kind: "choose-value",
          value: "counter-kind",
          on: 0,
          then: {
            kind: "may",
            prompt: "Put an additional counter of that kind on that permanent?",
            effect: { kind: "add-counter", target: 0, counter: CHOSEN_COUNTER, amount: 1 },
          },
        },
      },
      resolve: null,
      text: "II, III — For each non-Saga permanent, choose a counter on it. You may put an additional counter of that kind on that permanent.",
    },
    {
      at: [4],
      targets: [],
      effect: { kind: "search-library", filter: { subtype: "Doctor" }, destination: "hand", min: 0, max: 1, reveal: true },
      resolve: null,
      text: "IV — Search your library for a Doctor card, reveal it, put it into your hand, then shuffle.",
    },
  ],
});
