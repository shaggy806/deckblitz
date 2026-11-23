import { defineCard } from "../define.js";

// Playtest card (Unknown Event). Ready to run is a partner-family ability
// (rule 702.124): it pairs only with another card that has ready to run.

export default defineCard({
  name: "The Milling Runner",
  manaCost: "{U/B}{U/B}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Gamer"],
  power: 1,
  toughness: 2,
  keywords: ["islandwalk", "swampwalk"],
  pairing: { kind: "partner-group", group: "Ready to run" },
  text: "Islandwalk, swampwalk (This creature can't be blocked if defending player controls an Island or a Swamp)\nWhenever The Milling Runner deals combat damage to a player, target player mills three cards.\nReady to run (You can have two commanders if both have ready to run.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 3 },
      resolve: null,
      text: "Whenever The Milling Runner deals combat damage to a player, target player mills three cards.",
    },
  ],
});
