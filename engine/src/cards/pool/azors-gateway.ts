import { defineCard } from "../define.js";

// EDHREC rank 8646. The card from hand is exiled face up with the Gateway
// (linked, rule 607.2a); the different mana values among those, X as 0 (the
// rulings), are read right after.
const TEXT =
  "{1}, {T}: Draw a card, then exile a card from your hand. If cards with five or more different mana values are exiled with Azor's Gateway, you gain 5 life, untap Azor's Gateway, and transform it.";

export default defineCard({
  name: "Azor's Gateway",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "exile", leftover: "stay" },
          {
            kind: "conditional",
            condition: {
              kind: "amounts",
              left: { aggregate: "distinct", of: "mana-value", filter: {}, in: "exiled-with-source" },
              op: "gte",
              right: 5,
            },
            then: {
              kind: "sequence",
              effects: [
                { kind: "gain-life", amount: 5 },
                { kind: "untap", target: "source" },
                { kind: "transform", target: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Azor's Gateway", "Sanctum of the Sun"],
  transform: true,
});
