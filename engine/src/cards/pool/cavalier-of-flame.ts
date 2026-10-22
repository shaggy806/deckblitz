import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";

// EDHREC rank 6682.
//
// The dies trigger is Kumano Faces Kakkazan's "each opponent and each
// planeswalker they control", dealt at once by the Cavalier as it last
// existed; X counts the land cards in your graveyard as it resolves.
//
// Rulings:
//   [2019-07-12] As Cavalier of Flame's enters-the-battlefield ability resolves, you may choose to
//     discard zero cards. You just won't draw any cards.

const PUMP_TEXT = "{1}{R}: Creatures you control get +1/+0 and gain haste until end of turn.";
const ETB_TEXT = "When this creature enters, discard any number of cards, then draw that many cards.";
const DIES_TEXT =
  "When this creature dies, it deals X damage to each opponent and each planeswalker they control, where X is the number of land cards in your graveyard.";

const X: EffectAmount = { countInGraveyard: { type: "land", ownedBy: "you" } };

export default defineCard({
  name: "Cavalier of Flame",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Knight"],
  power: 6,
  toughness: 5,
  text: `${PUMP_TEXT}\n${ETB_TEXT}\n${DIES_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true },
          { kind: "draw", amount: { thisWay: "discarded" } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: X, who: "each-opponent" },
          { kind: "damage-all", filter: { type: "planeswalker", controlledBy: "opponent" }, amount: X },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
