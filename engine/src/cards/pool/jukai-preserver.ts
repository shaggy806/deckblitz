import { defineCard } from "../define.js";

// EDHREC rank 23884.
//
// Rulings:
//   [2022-02-18] If a channel ability requires a target, you may not activate it without a target
//     just to discard the card.
//   [2022-02-18] Discarding the card is part of the cost to activate a channel ability.
//
// Channel is a hand ability (`zone: "hand"`) whose cost discards this card.
// "Each of up to two target creatures" is Earth Kingdom Soldier's two
// optional, distinct slots.

const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on target creature you control.";
const CHANNEL_TEXT =
  "Channel — {2}{G}, Discard this card: Put a +1/+1 counter on each of up to two target creatures you control.";

export default defineCard({
  name: "Jukai Preserver",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Druid"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${CHANNEL_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      zone: "hand",
      targets: [
        { kind: "optional", of: "creature-you-control" },
        { kind: "optional", of: { kind: "other", of: "creature-you-control", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: CHANNEL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
