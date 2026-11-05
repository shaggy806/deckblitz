import { defineCard } from "../define.js";

const EXILE = "{1}, {T}: Exile target creature you own.";
const RETURN =
  "{2}, {T}, Sacrifice this land: Return a creature card exiled with this land to the battlefield under your control. Return each other card exiled with this land to its owner's hand.";

// A token exiled this way ceases to exist; a card returned is a new object
// (the rulings).
export default defineCard({
  name: "Northampton Farm",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${EXILE}\n${RETURN}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", ownedBy: "you" } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE,
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "exiled-with-source",
            min: 1,
            max: 1,
            filter: { type: "creature" },
            destination: "battlefield",
            under: "you",
            leftover: "stay",
          },
          { kind: "return-exiled-by-source", linked: "hand" },
        ],
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
