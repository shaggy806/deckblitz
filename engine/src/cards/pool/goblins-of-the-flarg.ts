import { defineCard } from "../define.js";

// Fallen Empires (FEM). EDHREC rank 25312.
//
// "When you control a Dwarf" is a state trigger (rule 603.8).

const SAC = "When you control a Dwarf, sacrifice this creature.";

export default defineCard({
  name: "Goblins of the Flarg",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["mountainwalk"],
  text: `Mountainwalk (This creature can't be blocked as long as defending player controls a Mountain.)\n${SAC}`,
  triggered: [
    {
      trigger: { on: "state", state: { kind: "controls", filter: { subtype: "Dwarf" }, atLeast: 1 } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC,
    },
  ],
});
