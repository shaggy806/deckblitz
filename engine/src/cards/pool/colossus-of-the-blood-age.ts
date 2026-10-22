import { defineCard } from "../define.js";

// EDHREC rank 17990.
//
// Rulings:
//   You choose how many cards to discard as Colossus of the Blood Age's last ability resolves.
//   You may choose to discard no cards and just draw a card.

const ENTER = "When this creature enters, it deals 3 damage to each opponent and you gain 3 life.";
const DIES = "When this creature dies, discard any number of cards, then draw that many cards plus one.";

export default defineCard({
  name: "Colossus of the Blood Age",
  manaCost: "{4}{R}{W}",
  colors: ["R", "W"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 6,
  toughness: 6,
  text: `${ENTER}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, who: "each-opponent" },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true },
          { kind: "draw", amount: { sum: [{ thisWay: "discarded" }, 1] } },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
