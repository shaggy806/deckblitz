import { defineCard } from "../define.js";

// EDHREC rank 17414.

export default defineCard({
  name: "Mirran Safehouse",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "As long as this artifact is on the battlefield, it has all activated abilities of all land cards in all graveyards.",
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "graveyard", filter: { type: "land" } },
      text: "As long as this artifact is on the battlefield, it has all activated abilities of all land cards in all graveyards.",
    },
  ],
});
