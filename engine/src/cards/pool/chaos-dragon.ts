import { defineCard } from "../define.js";

// EDHREC rank 4068.
//
// Rulings (abridged):
//   You roll a d20 as well as your opponents. If you had a higher result
//   than all of your opponents, Chaos Dragon won't have any restrictions on
//   who it may attack.
//   Anything that references the "result" of a die roll is looking for the
//   result after modifications.
//
// Each player rolls for themselves (`as-player`, so a roll replacement of
// theirs applies), in turn order; then each opponent who had the highest
// result (`"opponents-who-rolled-highest"`, ties included) is one the Dragon
// can't attack, nor planeswalkers they control, until end of combat.
const ATTACK_TEXT = "This creature attacks each combat if able.";
const ROLL_TEXT =
  "At the beginning of combat on your turn, each player rolls a d20. If one or more opponents had the highest result, this creature can't attack those players or planeswalkers they control this combat.";

export default defineCard({
  name: "Chaos Dragon",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ATTACK_TEXT}\n${ROLL_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-attack"], text: ATTACK_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: "each-player",
            effect: { kind: "as-player", who: "that-player", effect: { kind: "roll-dice", sides: 20 } },
          },
          {
            kind: "for-each-player",
            who: "opponents-who-rolled-highest",
            effect: {
              kind: "restrict",
              target: "source",
              restrictions: [{ kind: "cant-attack", at: { playerAndPlaneswalkers: "that-player" } }],
              duration: "until-end-of-combat",
            },
          },
        ],
      },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
});
