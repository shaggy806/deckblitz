import { defineCard } from "../define.js";

// EDHREC rank 25071.

export default defineCard({
  name: "Urza's Engine",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Juggernaut"],
  power: 1,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\n{3}: This creature gains banding until end of turn. (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)\n{3}: Attacking creatures banded with this creature gain trample until end of turn.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "banding", duration: "end-of-turn" },
      resolve: null,
      text: "{3}: This creature gains banding until end of turn.",
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", attacking: true, bandedWithSource: true },
        keyword: "trample",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{3}: Attacking creatures banded with this creature gain trample until end of turn.",
    },
  ],
});
