import { defineCard } from "../define.js";

// EDHREC rank 14161. Khans of Tarkir.
//
// Delve pays any of the generic part of the total cost, {X}{X} included
// (rule 702.66a).

export default defineCard({
  name: "Empty the Pits",
  manaCost: "{X}{X}{B}{B}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nCreate X tapped 2/2 black Zombie creature tokens.",
  delve: true,
  targets: [],
  effect: { kind: "create-token", token: "Zombie Token", count: "x", tapped: true },
});
