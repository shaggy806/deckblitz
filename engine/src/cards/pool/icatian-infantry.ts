import { defineCard } from "../define.js";

// EDHREC rank 24864.

export default defineCard({
  name: "Icatian Infantry",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "{1}: This creature gains first strike until end of turn.\n{1}: This creature gains banding until end of turn. (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}: This creature gains first strike until end of turn.",
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "banding", duration: "end-of-turn" },
      resolve: null,
      text: "{1}: This creature gains banding until end of turn.",
    },
  ],
});
