import { defineCard } from "../define.js";

// EDHREC rank 15470. "A card from exile with a discovery counter on it" is any
// such card, not only the one just exiled: one play this turn among them all.

const ATTACK_TEXT =
  "Whenever Lara Croft attacks, exile up to one target legendary artifact card or legendary land card from a graveyard and put a discovery counter on it. You may play a card from exile with a discovery counter on it this turn.";

export default defineCard({
  name: "Lara Croft, Tomb Raider",
  manaCost: "{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 3,
  toughness: 4,
  keywords: ["first-strike", "reach"],
  text: `First strike, reach\n${ATTACK_TEXT}\nRaid — At end of combat on your turn, if you attacked this turn, create a Treasure token.`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "any",
            filter: { supertype: "legendary", typesAnyOf: ["artifact", "land"] },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, withCounters: { kind: "discovery", amount: 1 } },
          {
            kind: "player-effect",
            duration: "end-of-turn",
            mayPlay: {
              from: "exile",
              whose: "each-player",
              play: true,
              filter: { counters: { kind: "discovery", compare: { op: "gte", n: 1 } } },
              upTo: 1,
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end-combat", who: "you" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "Raid — At end of combat on your turn, if you attacked this turn, create a Treasure token.",
    },
  ],
});
