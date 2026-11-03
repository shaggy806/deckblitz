import { defineCard } from "../define.js";

// Off the battlefield Grist is a legendary creature card, so it can be your
// commander without saying so (rule 903.3). The +1's repeat asks about that
// pass's mill alone (rule 608.2c), and Grist in the library is an Insect card.
const STATIC = "As long as Grist isn't on the battlefield, it's a 1/1 Insect creature in addition to its other types.";
const PLUS_ONE =
  "[+1]: Create a 1/1 black and green Insect creature token, then mill a card. If an Insect card was milled this way, put a loyalty counter on Grist and repeat this process.";
const MINUS_TWO = "[-2]: You may sacrifice a creature. When you do, destroy target creature or planeswalker.";
const MINUS_FIVE = "[-5]: Each opponent loses life equal to the number of creature cards in your graveyard.";

const milledAnInsect = { kind: "this-way", what: "milled", filter: { subtype: "Insect" } } as const;

export default defineCard({
  name: "Grist, the Hunger Tide",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Grist"],
  loyalty: 3,
  text: `${STATIC}\n${PLUS_ONE}\n${MINUS_TWO}\n${MINUS_FIVE}`,
  static: [
    {
      affects: { scope: "self" },
      selfOutsideBattlefield: { addTypes: ["creature"], addSubtypes: ["Insect"], power: 1, toughness: 1 },
      text: STATIC,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "repeat",
        again: milledAnInsect,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Insect Token (Black-Green)", count: 1 },
            { kind: "mill", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: milledAnInsect,
              then: { kind: "add-counter", target: "source", counter: "loyalty", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: PLUS_ONE,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
          effect: { kind: "destroy", target: 0 },
          text: "When you do, destroy target creature or planeswalker.",
        },
      },
      resolve: null,
      text: MINUS_TWO,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "lose-life",
        amount: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        who: "each-opponent",
      },
      resolve: null,
      text: MINUS_FIVE,
    },
  ],
});
