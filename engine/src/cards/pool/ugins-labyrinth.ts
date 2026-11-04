import { defineCard } from "../define.js";

const IMPRINT_TEXT = "Imprint — When this land enters, you may exile a colorless card with mana value 7 or greater from your hand.";
const MANA_TEXT = "{T}: Add {C}. If a card is exiled with this land, add {C}{C} instead.";
const RETURN_TEXT = "{T}: Return the exiled card to its owner's hand.";

export default defineCard({
  name: "Ugin's Labyrinth",
  colors: [],
  types: ["land"],
  text: `${IMPRINT_TEXT}\n${MANA_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: IMPRINT_TEXT,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        filter: { colorless: true, manaValue: { op: "gte", n: 7 } },
        destination: "exile",
        leftover: "stay",
      },
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      resolve: null,
      text: MANA_TEXT,
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: { ifCondition: { kind: "exiled-with-source", atLeast: 1, now: true }, then: 2, else: 1 },
      },
    },
    {
      cost: { mana: null, tap: true },
      resolve: null,
      text: RETURN_TEXT,
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
    },
  ],
});
