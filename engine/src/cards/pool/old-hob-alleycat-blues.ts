import { defineCard } from "../define.js";

// EDHREC rank 23891.
// Makes Mutant → "Mutant Token".
//
// Rulings:
//   In the case where the Mutant creature token isn't destroyed by the delayed triggered ability
//     (probably because it gained indestructible due to Old Hob's last ability), that delayed
//     triggered ability won't trigger again.
//
// "Destroy it at the beginning of the next end step" is a real delayed
// triggered ability (rule 603.7) on the token this made (`about: "created"`,
// Urabrask's Forge's shape) — destroyed, so indestructible saves it, and the
// delayed ability is done either way. The token is made on its own
// (`separate`), never folded into a stack with other Mutants, so only it is
// destroyed.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, create a 2/2 red Mutant creature token. It gains haste until end of turn. Destroy it at the beginning of the next end step.";
const SAVE_TEXT = "{1}{W}: Target attacking creature token gains indestructible until end of turn.";

export default defineCard({
  name: "Old Hob, Alleycat Blues",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Mutant", "Rebel"],
  power: 4,
  toughness: 4,
  text: `${COMBAT_TEXT}\n${SAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Mutant Token", count: 1, gainUntilEndOfTurn: ["haste"], separate: true },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "created",
            effect: { kind: "destroy", target: 0 },
            text: "Destroy it at the beginning of the next end step.",
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", token: true, attacking: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: SAVE_TEXT,
    },
  ],
});
