import { defineCard } from "../define.js";

// EDHREC rank 11146.

export default defineCard({
  name: "Manascape Refractor",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters tapped.\nThis artifact has all activated abilities of all lands on the battlefield.\nYou may spend mana as though it were mana of any color to pay the activation costs of this artifact's abilities.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "battlefield", filter: { type: "land" } },
      text: "This artifact has all activated abilities of all lands on the battlefield.",
    },
    {
      affects: { scope: "self" },
      spendManaAs: { as: "any-color", activating: "this" },
      text: "You may spend mana as though it were mana of any color to pay the activation costs of this artifact's abilities.",
    },
  ],
});
