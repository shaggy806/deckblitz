import { defineCard } from "../define.js";

// EDHREC rank 5535.
//
// The −1's "pay any amount of mana" is chosen as it resolves (the ruling):
// a `may` with an {X} cost, paying nothing the same as declining — then
// nothing is looked at (the ruling). Any mana pays it, a Powerstone's
// included (it isn't a spell). Once a card is looked at, one must go to hand.
// The emblem's ability is activated from the command zone (rule 114.4); its
// cost taps any untapped artifact, an artifact creature that just arrived
// included (the ruling, rule 302.6 being about {T} alone).

const PLUS_TEXT =
  '+1: Create a tapped Powerstone token. (It\'s an artifact with "{T}: Add {C}. This mana can\'t be spent to cast a nonartifact spell.")';
const MINUS_TEXT =
  "−1: Pay any amount of mana. Look at that many cards from the top of your library, then put one of those cards into your hand and the rest on the bottom of your library in a random order.";
const EMBLEM = "Tap an untapped artifact you control: This emblem deals 1 damage to any target.";
const ULT_TEXT = `−7: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Karn, Living Legacy",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Karn"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay any amount of mana to look at that many cards from the top of your library?",
        cost: "{X}",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: "x",
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "bottom-random",
        },
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        activated: [
          {
            cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { type: "artifact", controlledBy: "you" }, includeSelf: true } },
            targets: ["any-target"],
            effect: { kind: "damage", amount: 1, target: 0 },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
