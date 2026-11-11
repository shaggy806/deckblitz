import { defineCard } from "../define.js";

// The combined back face of Urza, Lord Protector and The Mightstone and
// Weakstone (rule 712.5): never a card of its own, only the face of the
// permanent they meld into (`meldOf`). Its mana value there is theirs summed,
// 8 (rule 712.8g); white and blue by its color indicator.
//
// Its first line lifts rule 606.3's once-a-turn for its own loyalty abilities
// alone (`loyaltyActivationsEachTurn`'s `of: "self"`), not for other
// planeswalkers its controller has, as Oath of Teferi's does. The +2's
// discount is Spellbinding Soprano's `player-effect`: it lasts the turn
// whatever becomes of Urza.
//
// Rulings:
//   [2022-10-14] During each of your turns, you may activate Urza, Planeswalker's loyalty
//     abilities twice, whether that's activating the same ability two times, or activating two
//     different abilities once each.
//   [2022-10-14] Note that the permanent represented by the combined back faces has a color
//     indicator.
//   [2022-10-14] While a melded permanent is on the battlefield, it has only the characteristics
//     of its combined back face. Any effects that modify how the new object enters the
//     battlefield will consider only the combined back face.
const TWICE_TEXT = "You may activate the loyalty abilities of Urza twice each turn rather than only once.";
const PLUS_TWO = "+2: Artifact, instant, and sorcery spells you cast this turn cost {2} less to cast. You gain 2 life.";
const PLUS_ONE = "+1: Draw two cards, then discard a card.";
const ZERO = "0: Create two 1/1 colorless Soldier artifact creature tokens.";
const MINUS_THREE = "−3: Exile target nonland permanent.";
const MINUS_TEN =
  "−10: Artifacts and planeswalkers you control gain indestructible until end of turn. Destroy all nonland permanents.";

export default defineCard({
  name: "Urza, Planeswalker",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Urza"],
  loyalty: 7,
  meldOf: ["Urza, Lord Protector", "The Mightstone and Weakstone"],
  text: `${TWICE_TEXT}\n${PLUS_TWO}\n${PLUS_ONE}\n${ZERO}\n${MINUS_THREE}\n${MINUS_TEN}`,
  static: [{ affects: { scope: "self" }, loyaltyActivationsEachTurn: { times: 2, of: "self" }, text: TWICE_TEXT }],
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "player-effect",
            duration: "end-of-turn",
            reduceSpells: { applies: { typesAnyOf: ["artifact", "instant", "sorcery"] }, reduceGeneric: 2 },
          },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: PLUS_TWO,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: PLUS_ONE,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Artifact Token", count: 2 },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["nonland-permanent"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: MINUS_THREE,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword-all",
            filter: { typesAnyOf: ["artifact", "planeswalker"], controlledBy: "you" },
            keyword: "indestructible",
            duration: "end-of-turn",
          },
          { kind: "destroy-all", filter: { notTypes: ["land"] } },
        ],
      },
      resolve: null,
      text: MINUS_TEN,
    },
  ],
});
