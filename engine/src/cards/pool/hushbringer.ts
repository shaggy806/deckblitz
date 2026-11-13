import { defineCard } from "../define.js";

// EDHREC rank 4075. Torpor Orb's static with dying added: every player's
// abilities, the creature's own included, read as the creature last existed
// (a land that became a creature counts). Replacement effects, "as this
// enters" choices and the event that caused a death (a sacrifice, a destroy)
// still work (the card's rulings).
const TEXT = "Creatures entering or dying don't cause abilities to trigger.";

export default defineCard({
  name: "Hushbringer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 2,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      suppressEntryTriggers: { who: "everyone", entering: { type: "creature" }, dying: { type: "creature" } },
      text: TEXT,
    },
  ],
});
