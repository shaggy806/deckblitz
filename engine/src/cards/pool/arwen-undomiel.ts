import { defineCard } from "../define.js";

// Ruling: the scry finishes before the trigger's target is chosen — `scries`
// fires once the scry is done (rule 701.22d).
const SCRY_TRIGGER = "Whenever you scry, put a +1/+1 counter on target creature.";
const SCRY_ABILITY = "{4}{G}{U}: Scry 2.";

export default defineCard({
  name: "Arwen Undómiel",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 2,
  toughness: 2,
  text: `${SCRY_TRIGGER}\n${SCRY_ABILITY}`,
  activated: [
    {
      cost: { mana: "{4}{G}{U}", tap: false },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: SCRY_ABILITY,
    },
  ],
  triggered: [
    {
      trigger: { on: "scries", who: "you" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SCRY_TRIGGER,
    },
  ],
});
