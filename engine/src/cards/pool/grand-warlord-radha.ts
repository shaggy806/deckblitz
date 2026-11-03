import { defineCard } from "../define.js";

// Rulings:
//   After the ability resolves, you can cast spells and activate abilities before blockers are
//     declared.
//   The mana is the number of creatures you attack with: creatures put onto the battlefield attacking
//     before it resolves don't count, and creatures that attacked but left combat do.

const TEXT =
  "Whenever one or more creatures you control attack, add that much mana in any combination of {R} and/or {G}. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Grand Warlord Radha",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: { triggerValue: true }, persists: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
