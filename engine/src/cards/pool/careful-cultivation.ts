import { defineCard } from "../define.js";

// EDHREC rank 11353.
// Makes Human Monk → use "Human Monk Token".
//
// Rulings:
//   [2022-02-18] Discarding the card is part of the cost to activate a channel ability.
//   [2022-02-18] If a channel ability requires a target, you may not activate it without a target
//     just to discard the card.
//
// The bonus, reach and the granted mana ability apply only while the
// enchanted permanent is a creature (Born to Drive's gate). Channel (rule
// 702.51a) is a hand ability that discards the card as its cost.
const CREATURE_TEXT = 'As long as enchanted permanent is a creature, it gets +1/+3 and has reach and "{T}: Add {G}{G}."';
const CHANNEL_TEXT =
  'Channel — {1}{G}, Discard this card: Create a 1/1 green Human Monk creature token with "{T}: Add {G}."';

export default defineCard({
  name: "Careful Cultivation",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${CREATURE_TEXT}\n${CHANNEL_TEXT}`,
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPt: [1, 3],
      grantKeywords: ["reach"],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "G", amount: 2 },
          resolve: null,
          text: "{T}: Add {G}{G}.",
        },
      ],
      text: CREATURE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      zone: "hand",
      targets: [],
      effect: { kind: "create-token", token: "Human Monk Token", count: 1 },
      resolve: null,
      text: CHANNEL_TEXT,
    },
  ],
});
