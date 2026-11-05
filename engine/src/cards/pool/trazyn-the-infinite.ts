import { defineCard } from "../define.js";

// EDHREC rank 10271.

export default defineCard({
  name: "Trazyn the Infinite",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 4,
  toughness: 6,
  keywords: ["deathtouch"],
  text: "Deathtouch\nPrismatic Gallery — As long as Trazyn is on the battlefield, it has all activated abilities of all artifact cards in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "graveyard", filter: { type: "artifact", ownedBy: "you" } },
      text: "Prismatic Gallery — As long as Trazyn is on the battlefield, it has all activated abilities of all artifact cards in your graveyard.",
    },
  ],
});
