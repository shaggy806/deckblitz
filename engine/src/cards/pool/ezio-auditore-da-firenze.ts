import { defineCard } from "../define.js";

const FREERUNNING_TEXT = "Assassin spells you cast have freerunning {B}{B}.";
const COMBAT_TEXT =
  "Whenever Ezio deals combat damage to a player, you may pay {W}{U}{B}{R}{G} if that player has 10 or less life. When you do, that player loses the game.";

export default defineCard({
  name: "Ezio Auditore da Firenze",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  text: "Menace\nAssassin spells you cast have freerunning {B}{B}. (You may cast a spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nWhenever Ezio deals combat damage to a player, you may pay {W}{U}{B}{R}{G} if that player has 10 or less life. When you do, that player loses the game.",
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { subtype: "Assassin" }, freerunning: "{B}{B}" },
      text: FREERUNNING_TEXT,
    },
  ],
  triggered: [
    {
      // Life checked as it resolves; once paid, the reflexive trigger makes
      // that player lose whatever their life is by then (the ruling).
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "life-total", who: "that-player", atMost: 10 },
        then: {
          kind: "may",
          prompt: "Pay {W}{U}{B}{R}{G}? When you do, that player loses the game.",
          cost: "{W}{U}{B}{R}{G}",
          effect: {
            kind: "reflexive-trigger",
            targets: [],
            effect: { kind: "lose-game", who: "trigger-player" },
            text: "When you do, that player loses the game.",
          },
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
