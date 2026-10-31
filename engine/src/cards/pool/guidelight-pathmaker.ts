import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// Where the find goes is read from the card itself (`instead`'s `filter`,
// `pick: "all"` — no choice): onto the battlefield with mana value 2 or less,
// otherwise into the hand. "You may search": declining doesn't shuffle.
export default defineCard({
  name: "Guidelight Pathmaker",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 5,
  keywords: ["vigilance"],
  text:
    "Vigilance\nWhen this Vehicle enters, you may search your library for an artifact card and reveal it. Put it onto the battlefield if its mana value is 2 or less. Otherwise, put it into your hand. If you search your library this way, shuffle.\n" +
    crewText(2),
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an artifact card?",
        effect: {
          kind: "search-library",
          filter: { type: "artifact" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
          instead: { destination: "battlefield", filter: { manaValue: { op: "lte", n: 2 } }, pick: "all" },
        },
      },
      resolve: null,
      text: "When this Vehicle enters, you may search your library for an artifact card and reveal it. Put it onto the battlefield if its mana value is 2 or less. Otherwise, put it into your hand. If you search your library this way, shuffle.",
    },
  ],
  activated: [crew(2, crewText(2))],
});
