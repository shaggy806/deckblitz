import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 9590.
//
// Rulings:
//   [2023-10-13] A player facing a villainous choice can always choose either option, even if one
//     or both of the options are impossible. For example, if one of the options is to sacrifice a
//     creature, a player who controls no creatures can still choose that option.
//   [2023-10-13] When a player faces a villainous choice, they first choose one of the two
//     options, then all actions in the chosen option are performed.
//   [2023-10-13] If a spell or ability requires multiple players to face a villainous choice, the
//     result is a little different from other effects in Magic. In that case, the first player in
//     turn order makes their choice and the action for that choice is performed before the next
//     player makes their choice. Then each of the remaining players repeat this process in turn
//     order.
//
// The villainous choice is Damocles Base's / Dr. Eggman's `choices` (rule
// 701.56): each opponent in turn picks one, done before the next is asked.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, each opponent faces a villainous choice — That player sacrifices a creature of their choice, or you create a 3/3 black Dalek artifact creature token with menace.";

export default defineCard({
  name: "The Dalek Emperor",
  manaCost: "{5}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Dalek"],
  power: 6,
  toughness: 6,
  text: `Affinity for Daleks (This spell costs {1} less to cast for each Dalek you control.)\nOther Daleks you control have haste.\n${COMBAT_TEXT}`,
  selfCostReduction: affinity({ subtype: "Dalek" }),
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Dalek", controlledBy: "you" }, excludeSelf: true },
      grantKeywords: ["haste"],
      text: "Other Daleks you control have haste.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        choices: [
          {
            text: "That player sacrifices a creature of their choice.",
            effect: { kind: "sacrifice", who: "that-player", filter: { type: "creature" }, count: 1 },
          },
          {
            text: "You create a 3/3 black Dalek artifact creature token with menace.",
            effect: { kind: "create-token", token: "Dalek Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
