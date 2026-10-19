import { defineCard } from "../define.js";

export default defineCard({
  name: "Join the Maestros",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  casualty: 2,
  text:
    "Casualty 2 (As you cast this spell, you may sacrifice a creature with power 2 or greater. When you do, copy this spell.)\n" +
    "Create a 4/3 black Ogre Warrior creature token.",
  effect: { kind: "create-token", token: "Ogre Warrior Token", count: 1 },
});
