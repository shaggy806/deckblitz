import { defineCard } from "../define.js";

// EDHREC rank 2253. "That much" is the damage the event dealt, not capped at
// its toughness (its ruling); the chosen player is read as the Doll last
// existed if it has left (rule 608.2h).

export default defineCard({
  name: "Stuffy Doll",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 1,
  keywords: ["indestructible"],
  text: "Indestructible\nAs this creature enters, choose a player.\nWhenever this creature is dealt damage, it deals that much damage to the chosen player.\n{T}: This creature deals 1 damage to itself.",
  choosePlayerOnEnter: "player",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "source" },
      resolve: null,
      text: "{T}: This creature deals 1 damage to itself.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "chosen-player" },
      resolve: null,
      text: "Whenever this creature is dealt damage, it deals that much damage to the chosen player.",
    },
  ],
});
