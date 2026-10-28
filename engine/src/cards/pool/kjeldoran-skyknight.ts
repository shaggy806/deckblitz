import { defineCard } from "../define.js";

// EDHREC rank 23011.

export default defineCard({
  name: "Kjeldoran Skyknight",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "first-strike", "banding"],
  text: "Flying; first strike; banding (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
});
