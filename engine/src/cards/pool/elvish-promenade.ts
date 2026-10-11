import { defineCard } from "../define.js";

// "Each Elf you control" counts every Elf permanent, a kindred Elf
// enchantment (Prowess of the Fair) as much as an Elf creature.

export default defineCard({
  name: "Elvish Promenade",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["kindred", "sorcery"],
  subtypes: ["Elf"],
  text: "Create a 1/1 green Elf Warrior creature token for each Elf you control.",
  effect: {
    kind: "create-token",
    token: "Elf Warrior Token",
    count: { countOf: { subtype: "Elf", controlledBy: "you" } },
  },
});
