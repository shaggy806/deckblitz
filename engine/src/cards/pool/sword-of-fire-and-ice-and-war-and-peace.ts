import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Playtest card: the two Swords at once, on combat damage to an opponent.
// The opponent dealt the damage is the defending player; both hands are
// counted as the ability resolves, after the draw.

const PROTECTION_TEXT = "Equipped creature gets +4/+4 and has protection from white, blue, and red.";
const DAMAGE_TEXT =
  "Whenever equipped creature deals combat damage to an opponent, Sword of Fire and Ice and War and Peace deals 2 damage to any target and you draw a card. Then, it deals damage to defending player equal to the number of cards in their hand and you gain 1 life for each card in your hand.";

export default defineCard({
  name: "Sword of Fire and Ice and War and Peace",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PROTECTION_TEXT}\n${DAMAGE_TEXT}\nEquip {4}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [4, 4],
      protection: { colors: ["W", "U", "R"] },
      text: PROTECTION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached", toOpponent: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "draw", amount: 1 },
          { kind: "damage", amount: { cardsInHand: "trigger-player" }, toTriggerRecipient: true },
          { kind: "gain-life", amount: { cardsInHand: "you" } },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
