import { defineCard } from "../define.js";

// The look shows the whole hand, then the choice is over its nonland cards. Only
// the chosen card is revealed, and "if you do" is what actually went to the bottom.
const TEXT =
  "When Vendilion Clique enters, look at target player's hand. You may choose a nonland card from it. If you do, that player reveals the chosen card, puts it on the bottom of their library, then draws a card.";

export default defineCard({
  name: "Vendilion Clique",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 3,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-at-hand", target: 0 },
          {
            kind: "look-and-choose",
            from: { target: 0 },
            zone: "hand",
            min: 0,
            max: 1,
            filter: { notTypes: ["land"] },
            destination: "reveal",
            leftover: "stay",
          },
          {
            kind: "look-and-choose",
            from: { target: 0 },
            zone: "hand",
            min: { thisWay: "revealed" },
            max: { thisWay: "revealed" },
            filter: { thisWay: "revealed" },
            destination: "library-bottom",
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-on-bottom" },
            then: { kind: "draw", amount: 1, target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
