import { defineCard } from "../define.js";

export default defineCard({
  name: "Shisato, Whispering Hunter",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior"],
  power: 2,
  toughness: 2,
  text: "At the beginning of your upkeep, sacrifice a Snake.\nWhenever Shisato deals combat damage to a player, that player skips their next untap step.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { subtype: "Snake" }, count: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice a Snake.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "skip-untap-step", who: "trigger-player" },
      resolve: null,
      text: "Whenever Shisato deals combat damage to a player, that player skips their next untap step.",
    },
  ],
});
