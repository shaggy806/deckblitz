import { defineCard } from "../define.js";

// EDHREC rank 8565.
const DAMAGE_TEXT = "Whenever Smaug is dealt noncombat damage, create that many Treasure tokens.";

export default defineCard({
  name: "Smaug the Impenetrable",
  manaCost: "{5}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 8,
  toughness: 7,
  keywords: ["flying", "indestructible", "haste"],
  text: `Flying, indestructible, haste\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self", combat: false },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
