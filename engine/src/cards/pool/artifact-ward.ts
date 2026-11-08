import { defineCard } from "../define.js";

export default defineCard({
  name: "Artifact Ward",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't be blocked by artifact creatures.\nPrevent all damage that would be dealt to enchanted creature by artifact sources.\nEnchanted creature can't be the target of abilities from artifact sources.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: [{ kind: "cant-be-blocked", by: { type: "artifact" } }],
      text: "Enchanted creature can't be blocked by artifact creatures.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "attached", source: { type: "artifact" }, instead: { prevent: true } },
      text: "Prevent all damage that would be dealt to enchanted creature by artifact sources.",
    },
    {
      affects: { scope: "attached" },
      hexproofFrom: { types: ["artifact"], abilitiesOnly: true, anyController: true, notHexproof: true },
      text: "Enchanted creature can't be the target of abilities from artifact sources.",
    },
  ],
});
