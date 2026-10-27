import { defineCard } from "../define.js";

const TEXT = "Whenever this creature or another Cleric dies, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Rotlung Reanimator",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    // This creature, whatever its types; then each other Cleric, anyone's.
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", subtype: "Cleric" }, otherOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
