import { defineCard } from "../define.js";

export default defineCard({
  name: "Shatterskull Minotaur",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 5,
  toughness: 4,
  keywords: ["haste"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { partySize: "you" },
  },
  text: "This spell costs {1} less to cast for each creature in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)\nHaste",
});
