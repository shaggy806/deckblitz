import { defineCard } from "../define.js";

const HIT =
  'Whenever this creature deals combat damage to a player, that player creates a 0/1 colorless Goblin Construct artifact creature token with "This token can\'t block" and "At the beginning of your upkeep, this token deals 1 damage to you."';

export default defineCard({
  name: "Relic Robber",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${HIT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Construct Token", count: 1, who: "trigger-player" },
      resolve: null,
      text: HIT,
    },
  ],
});
