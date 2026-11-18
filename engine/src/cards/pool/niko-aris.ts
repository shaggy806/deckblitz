import { defineCard } from "../define.js";

// EDHREC rank 14012.
//
// The +1's "whenever that creature deals damage this turn" is a delayed
// "whenever" watching its target (Paladin of Prahv's shape): any damage, not
// just combat damage (its ruling), each time; with no target chosen nothing
// is watched. The −1's damage is one amount, 2 for each card drawn this turn,
// dealt at once (its ruling).
//
// Rulings:
//   Niko deals all the damage for their second ability at the same time. For
//   example, if you've drawn two cards this turn, Niko will deal 4 damage to
//   the target tapped creature; they won't deal 2 damage, then deal 2 more
//   damage.
//   If Niko Aris enters the battlefield without being cast, they were cast
//   for a cost other than their mana cost, or if X was chosen to be 0, the
//   enters-the-battlefield ability won't create any Shard tokens.
//   The delayed triggered ability created by Niko's first loyalty ability will
//   trigger whenever the target creature deals any damage that turn, not just
//   combat damage.
const ENTERS =
  'When Niko Aris enters, create X Shard tokens. (They\'re enchantments with "{2}, Sacrifice this token: Scry 1, then draw a card.")';
const PLUS =
  "+1: Up to one target creature you control can't be blocked this turn. Whenever that creature deals damage this turn, return it to its owner's hand.";
const MINUS_DAMAGE = "−1: Niko Aris deals 2 damage to target tapped creature for each card you've drawn this turn.";
const MINUS_SHARD = "−1: Create a Shard token.";

export default defineCard({
  name: "Niko Aris",
  manaCost: "{X}{W}{U}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Niko"],
  loyalty: 3,
  text: `${ENTERS}\n${PLUS}\n${MINUS_DAMAGE}\n${MINUS_SHARD}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Shard Token", count: "x" },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: { whenever: { on: "deals-damage", who: "self" }, watching: 0 },
            effect: { kind: "return-to-hand", target: "trigger-object" },
            text: "Whenever that creature deals damage this turn, return it to its owner's hand.",
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", tapped: true } }],
      effect: { kind: "damage", amount: { product: [{ turnStat: "cards-drawn" }, 2] }, target: 0 },
      resolve: null,
      text: MINUS_DAMAGE,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Shard Token", count: 1 },
      resolve: null,
      text: MINUS_SHARD,
    },
  ],
});
