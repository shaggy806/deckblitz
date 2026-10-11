import { defineCard } from "../define.js";

// EDHREC rank 11493.

const DAMAGE_TEXT =
  "Whenever this creature is dealt damage, you may search your library for up to that many land cards, put them onto the battlefield tapped, then shuffle.";

// "That many" is the damage this event dealt it (`triggerValue`), read even
// if the damage was lethal and it has died since. Declining the "may" skips
// the search and its shuffle.
export default defineCard({
  name: "Hexhaven Invigorator",
  manaCost: "{G}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Chimera", "Horror"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for up to that many land cards?",
        effect: {
          kind: "search-library",
          filter: { type: "land" },
          destination: "battlefield",
          enterTapped: true,
          min: 0,
          max: { triggerValue: true },
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
