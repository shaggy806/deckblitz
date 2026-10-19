import { defineCard } from "../define.js";

const TEXT =
  "Keen Sight — When this creature enters, if an opponent controls more lands than you, search your library for a basic Plains card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Scouting Hawk",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "opponent-controls-more", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", subtype: "Plains" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
