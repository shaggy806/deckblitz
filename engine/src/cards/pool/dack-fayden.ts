import { defineCard } from "../define.js";

// EDHREC rank 6917. Control lasts indefinitely, Dack or no Dack (its ruling).
export default defineCard({
  name: "Dack Fayden",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Dack"],
  loyalty: 3,
  text: "+1: Target player draws two cards, then discards two cards.\n−2: Gain control of target artifact.\n−6: You get an emblem with \"Whenever you cast a spell that targets one or more permanents, gain control of those permanents.\"",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2, target: 0 },
          { kind: "discard", target: 0, amount: 2 },
        ],
      },
      resolve: null,
      text: "+1: Target player draws two cards, then discards two cards.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["artifact"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: "−2: Gain control of target artifact.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "Whenever you cast a spell that targets one or more permanents, gain control of those permanents.",
        triggered: [
          {
            trigger: { on: "cast-spell", who: "you", filter: { targets: { permanent: {} } } },
            targets: [],
            effect: { kind: "gain-control-all", filter: { inSet: { targetsOf: "trigger-object" } }, untilEndOfTurn: false },
            resolve: null,
            text: "Whenever you cast a spell that targets one or more permanents, gain control of those permanents.",
          },
        ],
      },
      resolve: null,
      text: "−6: You get an emblem with \"Whenever you cast a spell that targets one or more permanents, gain control of those permanents.\"",
    },
  ],
});
