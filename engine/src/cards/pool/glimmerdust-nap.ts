import { defineCard } from "../define.js";

export default defineCard({
  name: "Glimmerdust Nap",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant tapped creature\nEnchanted creature doesn't untap during its controller's untap step.",
  // The enchant ability is the spell's target slot (rule 303.4a), and the
  // state-based check re-reads it (704.5m): an untapped host sends the Aura
  // to its owner's graveyard (the ruling).
  targets: [{ kind: "permanent", filter: { type: "creature", tapped: true } }],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
