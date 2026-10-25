import { defineCard } from "../define.js";

// EDHREC rank 16652.
// The opponent is chosen at random as the ability resolves, each combat
// anew; if it can't attack that player it's free to attack elsewhere or not
// at all (the rulings — Ursine Monstrosity's `attack-random-opponent`). The
// life loss is half the damaged player's life as the trigger resolves,
// after the combat damage, rounded down.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, choose an opponent at random. This creature attacks that player this combat if able.";
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, that player loses half their life, rounded down.";

export default defineCard({
  name: "Raving Dead",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 6,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${COMBAT_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "attack-random-opponent", target: "source" },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: { half: { lifeTotal: "each" }, round: "down" } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
