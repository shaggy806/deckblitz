import { defineCard } from "../define.js";

// EDHREC rank 6041.
// Makes Survivor → new token "Survivor Token" (scaffolded).
//
// Rulings:
//   [2018-07-13] Survivor is a creature type. Varchild's second ability affects any creatures your
//     opponents control that happen to be Survivors, not just the Survivor tokens it creates.
//     Similarly, its third ability affects all creatures that happen to be Survivors. A creature
//     that's all creature types is a Survivor.
//   [2018-07-13] Varchild's second ability isn't locked in as Survivor tokens are created. For
//     example, if a player gains control of Varchild, that player's Survivor tokens may attack
//     Varchild's former controller.
//   [2018-07-13] The player who creates the Survivor tokens owns them, not Varchild's controller.
// Survivors are matched live, any creature of the type (the rulings), and the tokens are\ncreated by — so owned by — the damaged player.

const DAMAGE_TEXT =
  "Whenever Varchild deals combat damage to a player, that player creates that many 1/1 red Survivor creature tokens.";
const SURVIVORS_TEXT =
  "Survivors your opponents control can't block, and they can't attack you or planeswalkers you control.";
const LEAVES_TEXT = "When Varchild leaves the battlefield, gain control of all Survivors.";

export default defineCard({
  name: "Varchild, Betrayer of Kjeldor",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: `${DAMAGE_TEXT}\n${SURVIVORS_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Survivor Token", count: { triggerValue: true }, who: "trigger-player" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-control-all", filter: { subtype: "Survivor" }, untilEndOfTurn: false },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Survivor", controlledBy: "opponent" } },
      restrictions: ["cant-block"],
      cantAttackController: true,
      text: SURVIVORS_TEXT,
    },
  ],
});
