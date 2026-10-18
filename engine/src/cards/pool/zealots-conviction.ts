import { defineCard } from "../define.js";

// Corrupted as a static condition (The Seedcore's, Glistening Sphere's
// `player-counters`), on the enchanted creature beside the plain +1/+1.

const PUMP_TEXT = "Enchanted creature gets +1/+1.";
const CORRUPTED_TEXT =
  "Corrupted — As long as an opponent has three or more poison counters, enchanted creature gets an additional +1/+0 and has first strike.";

export default defineCard({
  name: "Zealot's Conviction",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${PUMP_TEXT}\n${CORRUPTED_TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 1], text: PUMP_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
      grantPt: [1, 0],
      grantKeywords: ["first-strike"],
      text: CORRUPTED_TEXT,
    },
  ],
});
