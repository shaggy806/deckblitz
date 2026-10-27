import { defineCard } from "../define.js";

const BOUNCE_TEXT = "{U}, Discard a card: Return this creature to its owner's hand.";

export default defineCard({
  name: "Escape Artist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `This creature can't be blocked.\n${BOUNCE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
  activated: [
    {
      cost: { mana: "{U}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
