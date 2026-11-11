import { defineCard } from "../define.js";

// Kaldheim. Rulings (2021-02-05):
//   The ghostform counter only marks the creature: the ability it gained
//     works with the counter removed, so the grant doesn't read it.
//   Several instances each trigger: the card comes back once, and each
//     makes a Spirit.
//   The emblem's spell is cast without paying its mana cost: X is 0, no
//     alternative cost, additional costs still paid.
//   A face-down card you own in exile can be cast only if you may look at
//     it (rule 406.3b).
//
// "Dies or is put into exile" is a leaves-the-battlefield trigger that looks
// back (rule 603.10a), as Ashnod's Intervention's: the return follows the
// card to whichever of the two zones it went to, and a card that has moved
// on since is a new object (rule 400.7).
const GHOSTFORM =
  "When this creature dies or is put into exile, return it to its owner's hand and create a 1/1 white Spirit creature token with flying.";
const PLUS = `+1: Put a ghostform counter on up to one target nontoken creature. It gains "${GHOSTFORM}"`;
const MINUS = "−3: Exile target nonland permanent.";
const EMBLEM =
  "At the beginning of your upkeep, you may cast a legendary spell from your hand, from your graveyard, or from among cards you own in exile without paying its mana cost.";
const ULTIMATE = `−7: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Kaya the Inexorable",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kaya"],
  loyalty: 5,
  text: `${PLUS}\n${MINUS}\n${ULTIMATE}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", token: false } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "ghostform", amount: 1 },
          {
            kind: "grant-triggered",
            target: 0,
            duration: "permanent",
            ability: {
              trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard", "exile"] },
              targets: [],
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
                  { kind: "return-to-hand", target: "trigger-object", from: "exile" },
                  { kind: "create-token", token: "Spirit Token", count: 1 },
                ],
              },
              resolve: null,
              text: GHOSTFORM,
            },
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["nonland-permanent"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        triggered: [
          {
            trigger: { on: "step-begins", step: "upkeep", who: "you" },
            targets: [],
            effect: {
              kind: "cast-now",
              from: { zones: ["hand", "graveyard", "exile"] },
              spell: { supertype: "legendary" },
              free: true,
            },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
