import { defineCard } from "../define.js";

// EDHREC rank 21508.
// Unstoppable Slasher's trigger: half the damaged player's life as the
// ability resolves, rounded up.

const DAMAGE_TEXT =
  "Whenever Radioactive Man deals combat damage to a player, that player loses half their life, rounded up.";

export default defineCard({
  name: "Radioactive Man",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 3,
  toughness: 5,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
