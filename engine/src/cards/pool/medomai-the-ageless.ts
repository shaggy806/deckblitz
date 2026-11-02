import { defineCard } from "../define.js";

// Theros.
export default defineCard({
  name: "Medomai the Ageless",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever Medomai deals combat damage to a player, take an extra turn after this one.\nMedomai can't attack during extra turns.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      text: "Whenever Medomai deals combat damage to a player, take an extra turn after this one.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "extra-turn" },
      restrictions: ["cant-attack"],
      text: "Medomai can't attack during extra turns.",
    },
  ],
});
