import { defineCard } from "../define.js";

// EDHREC rank 30891.

export default defineCard({
  name: "Beast Walkers",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Beast", "Soldier"],
  power: 2,
  toughness: 2,
  text: "{G}: This creature gains banding until end of turn. (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "banding", duration: "end-of-turn" },
      resolve: null,
      text: "{G}: This creature gains banding until end of turn.",
    },
  ],
});
