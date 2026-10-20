import { defineCard } from "../define.js";

// Devour artifact 1 (rule 702.82b): asked as it's about to enter, so it can't
// devour itself or anything entering with it (its rulings).
export default defineCard({
  name: "Caprichrome",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Goat"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "vigilance"],
  devour: { multiplier: 1, filter: { type: "artifact" } },
  text: "Flash\nVigilance\nDevour artifact 1 (As this creature enters, you may sacrifice any number of artifacts. It enters with that many +1/+1 counters on it.)",
});
