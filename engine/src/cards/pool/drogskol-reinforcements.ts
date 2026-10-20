import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// EDHREC rank 7943. Adriana's melee grant, to other Spirits; the prevention
// is a noncombat-only `would-deal-damage` prevent over Spirits you control
// (Iroas, God of Victory's `toFilter`).

const MELEE_TEXT =
  "Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)";
const GRANT_TEXT = "Other Spirits you control have melee.";
const PREVENT_TEXT = "Prevent all noncombat damage that would be dealt to Spirits you control.";

export default defineCard({
  name: "Drogskol Reinforcements",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${MELEE_TEXT}\n${GRANT_TEXT}\n${PREVENT_TEXT}`,
  triggered: [melee()],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Spirit", controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [melee()],
      text: GRANT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: false,
        prevent: true,
        toFilter: { subtype: "Spirit", controlledBy: "you" },
      },
      text: PREVENT_TEXT,
    },
  ],
});
