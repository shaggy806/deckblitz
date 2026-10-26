import { defineCard } from "../define.js";

// EDHREC rank 25974.
//
// Its ruling: revealing no cards, the spell's controller may pay {0} to keep
// it — the `unless` still asks.
const TEXT =
  "{2}{U}, {T}: Reveal any number of blue cards in your hand. Counter target spell unless its controller pays {1} for each card revealed this way.";

export default defineCard({
  name: "Brine Seer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: ["spell"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: { cardsInHand: "you" },
            filter: { colors: ["U"] },
            destination: "reveal",
            leftover: "stay",
          },
          {
            kind: "unless",
            chooser: 0,
            options: [{ payGeneric: { thisWay: "revealed", who: "you" }, text: "Pay {1} for each card revealed" }],
            otherwise: { kind: "counter", target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
