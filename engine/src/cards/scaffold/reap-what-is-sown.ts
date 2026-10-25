import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 23529.
//
// Rulings:
//   [2014-02-01] Reap What Is Sown can’t target the same creature multiple times. It will put only
//     one +1/+1 counter on each of its targets.

export default defineCard({
  name: "Reap What Is Sown",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Put a +1/+1 counter on each of up to three target creatures.",
  // TODO(scaffold): Put a +1/+1 counter on each of up to three target creatures.
});
