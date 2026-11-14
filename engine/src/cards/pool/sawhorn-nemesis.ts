import { defineCard } from "../define.js";

// EDHREC rank 6810.
//
// The chosen player is kept as `chosenPlayer` (rule 614.1c); the doubling
// reaches that player and the permanents they control — a battle by its
// controller, not its protector (the ruling). Damage being divided or
// assigned is split first and each share doubled (the ruling); with other
// effects on the same damage, the player dealt it (or the permanent's
// controller) orders them (rule 616.1). The source stays the original one.

export default defineCard({
  name: "Sawhorn Nemesis",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 4,
  text: "As this creature enters, choose a player.\nIf a source would deal damage to the chosen player or a permanent they control, it deals double that damage instead.",
  choosePlayerOnEnter: "player",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "chosen-player-side", instead: { modify: { times: 2 } } },
      text: "If a source would deal damage to the chosen player or a permanent they control, it deals double that damage instead.",
    },
  ],
});
