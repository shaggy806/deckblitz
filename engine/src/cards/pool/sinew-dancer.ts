import { defineCard } from "../define.js";

// EDHREC rank 18167.

const CORRUPTED_TEXT =
  "Corrupted — {W}, {T}: Tap target creature. Activate only if an opponent has three or more poison counters.";

export default defineCard({
  name: "Sinew Dancer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Soldier"],
  power: 1,
  toughness: 1,
  text: `{3}{W}, {T}: Tap target creature.\n${CORRUPTED_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{3}{W}, {T}: Tap target creature.",
    },
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
      text: CORRUPTED_TEXT,
    },
  ],
});
