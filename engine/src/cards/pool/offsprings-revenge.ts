import { defineCard } from "../define.js";

// EDHREC rank 21904. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] The token's power and toughness are 1/1. These are copiable values of the token
//     that other effects may copy. … gaining haste after the token has been created is not a
//     copiable value.
//   [2020-04-17] The token copies exactly what was printed on the original card and nothing else,
//     except the characteristics it specifically modifies.
//
// The Scarab God's shape — exile the card, then copy it with a base P/T
// exception — and the haste a plain grant on the token made this way, until
// your next turn (not a copy exception, per the ruling).

const COMBAT_TEXT =
  "At the beginning of combat on your turn, exile target red, white, or black creature card from your graveyard. Create a token that's a copy of that card, except it's 1/1. It gains haste until your next turn.";

export default defineCard({
  name: "Offspring's Revenge",
  manaCost: "{2}{R}{W}{B}",
  colors: ["W", "B", "R"],
  types: ["enchantment"],
  text: COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", anyOf: [{ colors: ["R"] }, { colors: ["W"] }, { colors: ["B"] }] },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "create-token-copy", of: 0, count: 1, who: "you", exceptions: { basePt: [1, 1] } },
          { kind: "grant-keyword-all", filter: { thisWay: "created" }, keyword: "haste", duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
