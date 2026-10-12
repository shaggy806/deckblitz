import { defineCard } from "../define.js";

export default defineCard({
  name: "Wormhole Serpent",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 3,
  toughness: 5,
  text: "{3}{U}: Target creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{3}{U}: Target creature can't be blocked this turn.",
    },
  ],
});
