import { defineCard } from "../define.js";

// EDHREC rank 22046. Any four untapped artifacts, creatures and/or lands,
// summoning-sick creatures included (its ruling): tapping them isn't a {T} cost.

export default defineCard({
  name: "Guardian of the Great Door",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "As an additional cost to cast this spell, tap four untapped artifacts, creatures, and/or lands you control.\nFlying",
  additionalCost: {
    also: {
      text: "Tap four untapped artifacts, creatures, and/or lands you control",
      tapUntapped: { filter: { typesAnyOf: ["artifact", "creature", "land"] }, count: 4 },
    },
  },
});
