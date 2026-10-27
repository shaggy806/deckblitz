import { defineCard } from "../define.js";

// EDHREC rank 29258.

export default defineCard({
  name: "Aurora Griffin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{W}: Target permanent becomes white until end of turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: ["permanent"],
      effect: { kind: "become-color", target: 0, colors: ["W"], duration: "end-of-turn" },
      resolve: null,
      text: "{W}: Target permanent becomes white until end of turn.",
    },
  ],
});
