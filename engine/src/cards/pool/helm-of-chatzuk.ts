import { defineCard } from "../define.js";

// EDHREC rank 19197.

export default defineCard({
  name: "Helm of Chatzuk",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{1}, {T}: Target creature gains banding until end of turn. (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding a player controls are blocking or being blocked by a creature, that player divides that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "banding", duration: "end-of-turn" },
      resolve: null,
      text: "{1}, {T}: Target creature gains banding until end of turn.",
    },
  ],
});
