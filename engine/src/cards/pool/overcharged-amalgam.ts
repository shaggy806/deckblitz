import { defineCard } from "../define.js";
import { exploit } from "../helpers.js";

// EDHREC rank 4917.
//
// A mana ability is never on the stack to target (rule 605.3b), and a
// replacement effect isn't an ability that uses it (the rulings).

export default defineCard({
  name: "Overcharged Amalgam",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nExploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, counter target spell, activated ability, or triggered ability.",
  triggered: [
    exploit(),
    {
      trigger: { on: "exploits", who: "self" },
      targets: [{ kind: "stack", spells: "any", abilities: true }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "When this creature exploits a creature, counter target spell, activated ability, or triggered ability.",
    },
  ],
});
