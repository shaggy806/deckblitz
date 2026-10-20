import { defineCard } from "../define.js";

// EDHREC rank 8433.
//
// Rulings:
//   [2022-02-18] If a channel ability requires a target, you may not activate it without a target
//     just to discard the card.
//   [2022-02-18] Discarding the card is part of the cost to activate a channel ability.
//
// Channel (rule 702.51a) is a hand ability that discards the card as its cost
// (Ghost-Lit Warder's shape). Its one slot takes a spell or an activated or
// triggered ability (Deny the Witch's `stack` spec); "its controller" decides
// whether to pay.
const CHANNEL_TEXT =
  "Channel — {2}{U}, Discard this card: Counter target spell or ability unless its controller pays {3}.";

export default defineCard({
  name: "Mirrorshell Crab",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Crab"],
  power: 5,
  toughness: 7,
  text: `Ward {3}\n${CHANNEL_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{3}" } },
      resolve: null,
      text: "Ward {3}",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "stack", spells: "any", abilities: true }],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: CHANNEL_TEXT,
      zone: "hand",
    },
  ],
});
