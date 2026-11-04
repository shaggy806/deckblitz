import { defineCard } from "../define.js";

// EDHREC rank 1532.
//
// Rulings:
//   If Dour Port-Mage leaves the battlefield at the same time one or more other creatures you
//     control leave the battlefield without dying, its first ability will still trigger.
//   Dour Port-Mage's first ability triggers whenever one or more creatures you control go to any
//     zone other than the graveyard from the battlefield. They could be returned to your hand, your
//     library, or exiled, for example.
const DRAW = "Whenever one or more other creatures you control leave the battlefield without dying, draw a card.";
const BOUNCE = "{1}{U}, {T}: Return another target creature you control to its owner's hand.";

export default defineCard({
  name: "Dour Port-Mage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Frog", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${DRAW}\n${BOUNCE}`,
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
        to: ["exile", "hand", "library", "command"],
        batched: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE,
    },
  ],
});
