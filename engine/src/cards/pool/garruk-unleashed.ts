import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] Garruk's second ability gives him only one loyalty counter, no matter how many
//     opponents control how many more creatures than you do.
//   [2020-06-23] If Garruk has only two loyalty counters, activating his second loyalty ability
//     results in him dying before it resolves. He won't be there to get a loyalty counter.

export default defineCard({
  name: "Garruk, Unleashed",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Garruk"],
  loyalty: 4,
  text: "+1: Up to one target creature gets +3/+3 and gains trample until end of turn.\n−2: Create a 3/3 green Beast creature token. Then if an opponent controls more creatures than you, put a loyalty counter on Garruk.\n−7: You get an emblem with \"At the beginning of your end step, you may search your library for a creature card, put it onto the battlefield, then shuffle.\"",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "+1: Up to one target creature gets +3/+3 and gains trample until end of turn.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "3/3 Beast Token", count: 1 },
          // Read after the Beast is made; one counter however many opponents qualify.
          {
            kind: "conditional",
            condition: { kind: "opponent-controls-more", filter: { type: "creature" } },
            then: { kind: "add-counter", target: "source", counter: "loyalty", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "−2: Create a 3/3 green Beast creature token. Then if an opponent controls more creatures than you, put a loyalty counter on Garruk.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "At the beginning of your end step, you may search your library for a creature card, put it onto the battlefield, then shuffle.",
        triggered: [
          {
            trigger: { on: "step-begins", step: "end", who: "you" },
            targets: [],
            effect: {
              kind: "may",
              prompt: "Search your library for a creature card and put it onto the battlefield?",
              effect: {
                kind: "search-library",
                filter: { type: "creature" },
                destination: "battlefield",
                min: 0,
                max: 1,
              },
            },
            resolve: null,
            text: "At the beginning of your end step, you may search your library for a creature card, put it onto the battlefield, then shuffle.",
          },
        ],
      },
      resolve: null,
      text: "−7: You get an emblem with \"At the beginning of your end step, you may search your library for a creature card, put it onto the battlefield, then shuffle.\"",
    },
  ],
});
