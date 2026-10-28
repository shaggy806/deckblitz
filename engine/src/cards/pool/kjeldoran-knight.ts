import { defineCard } from "../define.js";

// EDHREC rank 23625.

export default defineCard({
  name: "Kjeldoran Knight",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  keywords: ["banding"],
  text: "Banding (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)\n{1}{W}: This creature gets +1/+0 until end of turn.\n{W}{W}: This creature gets +0/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}: This creature gets +1/+0 until end of turn.",
    },
    {
      cost: { mana: "{W}{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{W}{W}: This creature gets +0/+2 until end of turn.",
    },
  ],
});
