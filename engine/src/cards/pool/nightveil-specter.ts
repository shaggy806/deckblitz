import { defineCard } from "../define.js";

export default defineCard({
  name: "Nightveil Specter",
  manaCost: "{U/B}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature deals combat damage to a player, that player exiles the top card of their library.\nYou may play lands and cast spells from among cards exiled with this creature.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, that player exiles the top card of their library.",
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 1, linked: true },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      text: "You may play lands and cast spells from among cards exiled with this creature.",
      playFromExile: { filter: {}, linked: true },
    },
  ],
});
