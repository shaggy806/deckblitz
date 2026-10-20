import { defineCard } from "../define.js";

// "Is also a Cleric, Rogue, Warrior, and Wizard" is a CDA (rule 604.3): it
// applies in every zone (its ruling), so it's `alsoSubtypes`, not a static.
// On the stack it isn't in your party: the cost reduction counts creatures on
// the battlefield.
export default defineCard({
  name: "Veteran Adventurer",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  alsoSubtypes: ["Cleric", "Rogue", "Warrior", "Wizard"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { partySize: "you" },
  },
  text: "Veteran Adventurer is also a Cleric, Rogue, Warrior, and Wizard.\nThis spell costs {1} less to cast for each creature in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)\nVigilance",
});
