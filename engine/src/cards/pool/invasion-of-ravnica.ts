import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 14512.
//
// "Isn't exactly two colors": colorless, one color, or three or more (the
// ruling) — `not` of `colorCount: 2`, read as the permanent is now.

const ENTER_TEXT =
  "When this Siege enters, exile target nonland permanent an opponent controls that isn't exactly two colors.";

export default defineCard({
  name: "Invasion of Ravnica",
  manaCost: "{5}",
  colors: [],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", filter: { notTypes: ["land"], controlledBy: "opponent", not: { colorCount: 2 } } },
      ],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Ravnica", "Guildpact Paragon"],
  transform: true,
});
