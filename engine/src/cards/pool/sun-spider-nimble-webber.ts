import { defineCard } from "../define.js";

const FLYING_TEXT = "During your turn, Sun-Spider has flying.";
const ETB_TEXT =
  "When Sun-Spider enters, search your library for an Aura or Equipment card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Sun-Spider, Nimble Webber",
  manaCost: "{3}{W/U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 3,
  toughness: 2,
  text: `${FLYING_TEXT}\n${ETB_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Open the Armory's search (a search for a quality may find nothing).
      effect: {
        kind: "search-library",
        filter: { subtypes: ["Aura", "Equipment"] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
