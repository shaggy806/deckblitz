import { defineCard } from "../define.js";

// EDHREC rank 20696.

export default defineCard({
  name: "Reinforcements",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put up to three target creature cards from your graveyard on top of your library.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      max: 3,
    },
  ],
  effect: { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "top" },
});
