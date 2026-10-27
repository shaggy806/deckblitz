import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

// Champions of Kamigawa. EDHREC rank 18615. This creature isn't legendary,
// so it never counts for its own condition.

const STATIC_TEXT = "As long as you control a legendary Samurai, this creature gets +1/+2 and has vigilance.";

export default defineCard({
  name: "Konda's Hatamoto",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 1,
  toughness: 2,
  text: `Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)\n${STATIC_TEXT} (Attacking doesn't cause this creature to tap.)`,
  triggered: [...bushido(1)],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Samurai", supertype: "legendary" }, atLeast: 1 },
      grantPt: [1, 2],
      grantKeywords: ["vigilance"],
      text: STATIC_TEXT,
    },
  ],
});
