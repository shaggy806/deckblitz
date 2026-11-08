import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 26115.
//
// Rulings:
//   [2009-10-01] The activated ability checks the power the exiled creatures had as they last
//     existed on the battlefield.

export default defineCard({
  name: "Sword of the Ages",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters tapped.\n{T}, Sacrifice this artifact and any number of creatures you control: This artifact deals X damage to any target, where X is the total power of the creatures sacrificed this way, then exile this artifact and those creature cards.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
  // TODO(scaffold): {T}, Sacrifice this artifact and any number of creatures you control: This artifact deals X damage to any target, where X is the total power of the creatures sacrificed this way, then exile this artifact and those creature cards.
});
