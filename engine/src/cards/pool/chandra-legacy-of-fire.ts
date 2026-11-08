import { defineCard } from "../define.js";

// EDHREC rank 6377. "Any number of permanents", one counter off each (`remove-counters`
// with `count: "any"`, `perObject: 1`, Garnet's shape); "that many" is what came off.

const PLANESWALKERS = { countOf: { type: "planeswalker", controlledBy: "you" } } as const;

export default defineCard({
  name: "Chandra, Legacy of Fire",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 3,
  text: "At the beginning of your end step, Chandra deals X damage to each opponent, where X is the number of planeswalkers you control.\n+1: Add {R} for each planeswalker you control.\n0: Remove a loyalty counter from each of any number of permanents you control. Exile that many cards from the top of your library. You may play them this turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: PLANESWALKERS, who: "each-opponent" },
      resolve: null,
      text: "At the beginning of your end step, Chandra deals X damage to each opponent, where X is the number of planeswalkers you control.",
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: PLANESWALKERS },
      resolve: null,
      text: "+1: Add {R} for each planeswalker you control.",
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counters", from: {}, counter: "loyalty", count: "any", among: true, perObject: 1 },
          { kind: "impulse-exile", amount: { thisWay: "counters-removed" }, duration: "end-of-turn", play: true },
        ],
      },
      resolve: null,
      text: "0: Remove a loyalty counter from each of any number of permanents you control. Exile that many cards from the top of your library. You may play them this turn.",
    },
  ],
});
