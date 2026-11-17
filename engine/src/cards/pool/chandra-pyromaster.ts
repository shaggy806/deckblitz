import { defineCard } from "../define.js";

// EDHREC rank 13255. The +1's creature is up to one, controlled by the first
// target's player or that planeswalker's controller (`sameController` on slot
// 0, Soul of Shandalar's shape); it can't block even if the damage is
// prevented (the rulings). The 0 is an impulse exile, a land played with a
// land drop. The −7 chooses one instant or sorcery card among the ten exiled
// this way — as it lies in exile — and makes three copies of it, each cast
// or not as its own "may" while this resolves (rule 707.12a), timing ignored,
// without paying their mana costs (X is 0, rule 107.3b); the card itself
// stays exiled, and a copy not cast ceases to exist (704.5e). Capricious
// Hellraiser's shape, with three copies.

const PLUS = "+1: Chandra deals 1 damage to target player or planeswalker and 1 damage to up to one target creature that player or that planeswalker's controller controls. That creature can't block this turn.";
const ZERO = "0: Exile the top card of your library. You may play it this turn.";
const ULTIMATE =
  "−7: Exile the top ten cards of your library. Choose an instant or sorcery card exiled this way and copy it three times. You may cast the copies without paying their mana costs.";

export default defineCard({
  name: "Chandra, Pyromaster",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 4,
  text: `${PLUS}\n${ZERO}\n${ULTIMATE}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [
        "player-or-planeswalker",
        { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 }, sameController: true, sameObjectAllowed: true } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "damage", amount: 1, target: 0 },
              { kind: "damage", amount: 1, target: 1 },
            ],
          },
          { kind: "restrict", target: 1, restrictions: ["cant-block"] },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 10 },
          {
            kind: "look-and-choose",
            zone: "exiled-this-way",
            filter: { typesAnyOf: ["instant", "sorcery"] },
            min: 1,
            max: 1,
            destination: "stay",
            leftover: "stay",
            prompt: "Choose an instant or sorcery card exiled this way to copy three times",
          },
          { kind: "cast-now", from: "chosen-this-way", copies: 3, free: true },
        ],
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
