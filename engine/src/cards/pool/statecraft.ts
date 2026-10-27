import { defineCard } from "../define.js";

// EDHREC rank 14271.
//
// Fog Bank's two combat-only prevention shields, widened to every creature
// this enchantment's controller controls: one on combat damage dealt to them
// (`toFilter`), one on combat damage they deal (`source`, read as the source
// is — or last was — when the damage would be dealt).

const TEXT = "Prevent all combat damage that would be dealt to and dealt by creatures you control.";
const YOUR_CREATURES = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Statecraft",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", combat: true, prevent: true, toFilter: YOUR_CREATURES },
      text: TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", combat: true, prevent: true, source: YOUR_CREATURES },
      text: TEXT,
    },
  ],
});
