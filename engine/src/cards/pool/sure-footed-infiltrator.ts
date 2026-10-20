import { defineCard } from "../define.js";

// EDHREC rank 17428.
//
// Rulings:
//   [2020-09-25] Once a creature has blocked Sure-Footed Infiltrator, activating its first ability
//     won't cause it to become unblocked or remove that blocking creature from combat.
//   [2020-09-25] You can tap any other untapped Rogue you control, including one you haven't
//     controlled continuously since the beginning of your most recent turn, to pay the cost of
//     Sure-Footed Infiltrator's first ability.

const TAP_TEXT = "Tap another untapped Rogue you control: This creature can't be blocked this turn.";
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Sure-Footed Infiltrator",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 3,
  text: `${TAP_TEXT}\n${DAMAGE_TEXT}`,
  activated: [
    {
      // "Another": no includeSelf (Kumena, Tyrant of Orazca's shape).
      cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { subtype: "Rogue", controlledBy: "you" } } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
