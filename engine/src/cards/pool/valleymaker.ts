import { defineCard } from "../define.js";

// "Choose a player. That player adds {G}{G}{G}" is a mana ability that doesn't
// target (the ruling): the player is named as it's activated (rule 605.3b),
// Victory Chimes' playerOfChoice, offered once per player still in the game.
const DAMAGE_TEXT = "{T}, Sacrifice a Mountain: This creature deals 3 damage to target creature.";
const MANA_TEXT = "{T}, Sacrifice a Forest: Choose a player. That player adds {G}{G}{G}.";

export default defineCard({
  name: "Valleymaker",
  manaCost: "{5}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Giant", "Shaman"],
  power: 5,
  toughness: 5,
  text: `${DAMAGE_TEXT}\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Mountain" } } },
      targets: ["creature"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Forest" } } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 3, playerOfChoice: true },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
