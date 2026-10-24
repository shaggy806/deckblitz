import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 19181.
//
// The enchanted creature is the granted trigger's source (the ruling).
const GRANT_TEXT =
  "Enchanted creature gets +1/+1 and has \"Whenever this creature attacks, tap target creature defending player controls.\"";

export default defineCard({
  name: "Grasp of the Hieromancer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: ["creature-defending-player-controls"],
          effect: { kind: "tap", target: 0 },
          resolve: null,
          text: "Whenever this creature attacks, tap target creature defending player controls.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
