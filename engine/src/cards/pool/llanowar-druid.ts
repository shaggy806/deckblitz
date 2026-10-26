import { defineCard } from "../define.js";

// Every Forest on the battlefield, not just yours (the ruling).

export default defineCard({
  name: "Llanowar Druid",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 2,
  text: "{T}, Sacrifice this creature: Untap all Forests.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "untap-all", filter: { subtype: "Forest" } },
      resolve: null,
      text: "{T}, Sacrifice this creature: Untap all Forests.",
    },
  ],
});
