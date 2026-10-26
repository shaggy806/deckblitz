import { defineCard } from "../define.js";

// Back face of Lambholt Elder.

export default defineCard({
  name: "Silverpelt Werewolf",
  art: "https://cards.scryfall.io/art_crop/back/9/3/932d753d-9584-4ad8-9a5e-a3524184f961.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 5,
  text: "Whenever this creature deals combat damage to a player, draw a card.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, draw a card.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  faces: ["Lambholt Elder", "Silverpelt Werewolf"],
  transform: true,
});
