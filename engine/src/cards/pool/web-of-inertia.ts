import { defineCard } from "../define.js";

// EDHREC rank 11859.
//
// - The player whose turn it is chooses (Champions of Minas Tirith's
//   `unless`): exile a card from their graveyard — not possible with an empty
//   one — or their creatures can't attack you this turn. A filter, so a
//   creature they gain or cast later this turn is bound too (rule 611.2c), and
//   it lasts though this leaves; planeswalkers and battles you control can
//   still be attacked.

const TEXT =
  "At the beginning of combat on each opponent's turn, that player may exile a card from their graveyard. If the player doesn't, creatures they control can't attack you this turn.";

export default defineCard({
  name: "Web of Inertia",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "opponent" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ exileFromGraveyard: 1, text: "Exile a card from your graveyard" }],
        otherwise: {
          kind: "restrict",
          filter: { type: "creature", controlledBy: "you" },
          sideOf: "active-player",
          restrictions: [{ kind: "cant-attack", at: "you" }],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
