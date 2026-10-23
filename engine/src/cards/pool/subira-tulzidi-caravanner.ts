import { defineCard } from "../define.js";

// EDHREC rank 8240.
// The first ability's target is checked again as it resolves — power above
// 2 then and it doesn't resolve; raised after, the creature still can't be
// blocked, and one already blocked stays blocked (the rulings). The second
// sets up a delayed triggered ability for the rest of the turn (rule
// 603.7c), whose power check is the creature's as the damage is dealt (the
// ruling); it can be activated with an empty hand.
const EVADE_TEXT = "{1}: Another target creature with power 2 or less can't be blocked this turn.";
const DRAW_TEXT =
  "{1}{R}, {T}, Discard your hand: Until end of turn, whenever a creature you control with power 2 or less deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Subira, Tulzidi Caravanner",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${EVADE_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [
        { kind: "other", of: { kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } } },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: EVADE_TEXT,
    },
    {
      cost: { mana: "{1}{R}", tap: true, discardHand: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: {
            on: "deals-combat-damage-to-player",
            who: "you-control",
            filter: { type: "creature", power: { op: "lte", n: 2 } },
          },
        },
        effect: { kind: "draw", amount: 1 },
        text: "Whenever a creature you control with power 2 or less deals combat damage to a player, draw a card.",
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
