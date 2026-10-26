import { defineCard } from "../define.js";

const TEXT = "Whenever a player casts a spell from a graveyard, this creature deals 3 damage to that player.";

export default defineCard({
  name: "Ash Zealot",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike", "haste"],
  text: `First strike, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", from: "graveyard" },
      targets: [],
      effect: { kind: "damage", amount: 3, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
