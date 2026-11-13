import { defineCard } from "../define.js";

// - +1's sacrifice is chosen as it resolves (ruling): an `each-player-may`
//   of "you", its "was a commander" read off what was sacrificed this way.
// - −10 gains control of the commanders already on the battlefield first,
//   then puts every player's commanders from the command zone onto the
//   battlefield under your control (ruling): `return-from-graveyard`'s
//   `from: "command-zone"`.
// - Leaving the game, the commanders it took go back or are exiled (rule
//   800.4a), as any control-changing effect's.

const PLUS_TWO = "+2: Create two 0/1 black Thrull creature tokens.";
const PLUS_ONE =
  "+1: You may sacrifice another creature or planeswalker. If you do, draw two cards, then draw another card if the sacrificed permanent was a commander.";
const MINUS_TEN =
  "−10: Gain control of all commanders. Put all commanders from the command zone onto the battlefield under your control.";

export default defineCard({
  name: "Tevesh Szat, Doom of Fools",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Szat"],
  loyalty: 4,
  canBeCommander: true,
  pairing: { kind: "partner" },
  text: `${PLUS_TWO}\n${PLUS_ONE}\n${MINUS_TEN}\nTevesh Szat, Doom of Fools can be your commander.\nPartner (You can have two commanders if both have partner.)`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Thrull Token", count: 2 },
      resolve: null,
      text: PLUS_TWO,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { typesAnyOf: ["creature", "planeswalker"] },
            exceptSource: true,
            text: "Sacrifice another creature or planeswalker",
          },
        ],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 2 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", who: "you", filter: { isCommander: true } },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: PLUS_ONE,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control-all", filter: { isCommander: true }, untilEndOfTurn: false },
          { kind: "return-from-graveyard", from: "command-zone", filter: { isCommander: true }, destination: "battlefield", count: "all" },
        ],
      },
      resolve: null,
      text: MINUS_TEN,
    },
  ],
});
