import { defineCard } from "../define.js";

// EDHREC rank 4173. "Equipped creature" in the upkeep trigger is the
// `"attached"` ref; "that player" is the active player (each opponent's
// upkeep). "Can't attack you" stays relative to the Suit's controller while
// the opponent controls the creature, so it can't be sent back at you.
//
// Rulings:
//   [2014-11-07] If an effect instructs you to sacrifice a creature, and you control any creatures
//     other than the creature equipped with Assault Suit, you must sacrifice one of them. You
//     can't try to sacrifice the equipped creature, fail, and therefore ignore the effect.
//   [2014-11-07] The equipped creature can't be sacrificed for any reason. If an effect instructs
//     you to sacrifice it, you can't and it remains on the battlefield. You also can't sacrifice
//     it to pay a cost that requires you to sacrifice a creature.

const STATIC_TEXT =
  "Equipped creature gets +2/+2, has haste, can't attack you or planeswalkers you control, and can't be sacrificed.";
const UPKEEP_TEXT =
  "At the beginning of each opponent's upkeep, you may have that player gain control of equipped creature until end of turn. If you do, untap it.";

export default defineCard({
  name: "Assault Suit",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${UPKEEP_TEXT}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["haste"],
      cantAttackController: true,
      cantBeSacrificed: true,
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have that player gain control of the equipped creature until end of turn, and untap it?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-control", target: "attached", who: "active-player", untilEndOfTurn: true },
            { kind: "untap", target: "attached" },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
