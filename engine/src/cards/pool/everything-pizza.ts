import { defineCard } from "../define.js";

// EDHREC rank 14787.
//
// The sacrifice ability has three target slots — the player, any target,
// and up to one creature — and does each instruction in printed order. A
// target that has become illegal is skipped on its own; the rest still
// happens (rule 608.2b). The damage's source is the sacrificed Pizza as it
// last existed (rule 608.2h).
const ENTERS =
  "When this artifact enters, search your library for a basic land card, reveal it, put it into your hand, then shuffle.";
const SAC =
  "{2}{W}{U}{B}{R}{G}, {T}, Sacrifice this artifact: Target player gains 3 life and draws a card. Each of your opponents discards a card. This artifact deals 3 damage to any target. Put three +1/+1 counters on up to one target creature.";

export default defineCard({
  name: "Everything Pizza",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food"],
  text: `${ENTERS}\n${SAC}`,
  activated: [
    {
      cost: { mana: "{2}{W}{U}{B}{R}{G}", tap: true, sacrifice: "self" },
      targets: ["player", "any-target", { kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3, toControllerOfTarget: 0 },
          { kind: "draw", amount: 1, target: 0 },
          { kind: "discard", target: "each-opponent", amount: 1 },
          { kind: "damage", amount: 3, target: 1 },
          { kind: "add-counter", target: 2, counter: "+1/+1", amount: 3 },
        ],
      },
      resolve: null,
      text: SAC,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
