import { defineCard } from "../define.js";

// EDHREC rank 30351.

const BOUNCE_TEXT =
  "{U}, {T}: Return another target permanent you control to its owner's hand. Activate only during your turn.";

export default defineCard({
  name: "Shi'ar Soldier",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shi'ar", "Soldier"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${BOUNCE_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      condition: { kind: "your-turn" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
