import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 6434.

export default defineCard({
  name: "Hatchery Sliver",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "Replicate {1}{G} (When you cast this spell, copy it for each time you paid its replicate cost.)\nEach Sliver spell you cast has replicate. The replicate cost is equal to its mana cost. (A copy of a permanent spell becomes a token.)",
  // TODO(scaffold): Replicate {1}{G}
  // TODO(scaffold): Each Sliver spell you cast has replicate. The replicate cost is equal to its mana cost.
});
