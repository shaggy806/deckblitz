import { defineCard } from "../define.js";

// EDHREC rank 18882.

export default defineCard({
  name: "Baton of Morale",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{2}: Target creature gains banding until end of turn. (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding a player controls are blocking or being blocked by a creature, that player divides that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "banding", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Target creature gains banding until end of turn.",
    },
  ],
});
