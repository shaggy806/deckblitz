import { defineCard } from "../define.js";

export default defineCard({
  name: "Passwall Adept",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: "{2}{U}: Target creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{2}{U}: Target creature can't be blocked this turn.",
    },
  ],
});
