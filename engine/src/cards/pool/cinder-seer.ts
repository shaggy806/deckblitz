import { defineCard } from "../define.js";

// Rulings:
//   You can reveal zero cards and deal zero damage.

const TEXT =
  "{2}{R}, {T}: Reveal any number of red cards in your hand. This creature deals X damage to any target, where X is the number of cards revealed this way.";

export default defineCard({
  name: "Cinder Seer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: { cardsInHand: "you" },
            filter: { colors: ["R"] },
            destination: "reveal",
            leftover: "stay",
          },
          { kind: "damage", target: 0, amount: { thisWay: "revealed", who: "you" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
