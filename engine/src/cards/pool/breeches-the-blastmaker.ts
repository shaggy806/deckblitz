import { defineCard } from "../define.js";

// EDHREC rank 8316.
//
// The sacrifice is a choice made as the trigger resolves (Mica, Reader of
// Ruins' `each-player-may`); no artifact sacrificed, no flip (the ruling).
// "When you win / lose the flip" are two reflexive triggered abilities
// (rule 603.12; the ruling: only one of them triggers), so each goes on the
// stack on its own and can be responded to — the lose one choosing its target
// then, knowing the damage. Both read "that spell" through the cast trigger's
// event: the copy is of the spell as it last was on the stack if it has left
// (Mica's `"trigger-spell"`), and its mana value includes its {X} (rule
// 202.3e), read as it last was there once it's gone.
//
// Rulings:
//   [2024-04-12] Spells that were cast before Breeches entered the battlefield count. If Breeches
//     was the first spell you cast this turn, the next spell you cast this turn is your second
//     spell.
//   [2024-04-12] If the spell that's copied has an X whose value was determined as it was cast,
//     the copy will have the same value of X.
const CAST_TEXT =
  "Whenever you cast your second spell each turn, you may sacrifice an artifact. If you do, flip a coin. When you win the flip, copy that spell. You may choose new targets for the copy. When you lose the flip, Breeches deals damage equal to that spell's mana value to any target.";

export default defineCard({
  name: "Breeches, the Blastmaker",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Pirate"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        ifDid: {
          kind: "flip-coin",
          won: {
            kind: "reflexive-trigger",
            targets: [],
            effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
            text: "When you win the flip, copy that spell. You may choose new targets for the copy.",
          },
          lost: {
            kind: "reflexive-trigger",
            targets: ["any-target"],
            effect: { kind: "damage", target: 0, amount: { manaValueOf: "trigger-object" } },
            text: "When you lose the flip, Breeches deals damage equal to that spell's mana value to any target.",
          },
        },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
