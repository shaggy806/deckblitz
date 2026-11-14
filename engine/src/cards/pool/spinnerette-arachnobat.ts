import { defineCard } from "../define.js";

const OPEN = "When Spinnerette enters, open an Attraction.";
const THREE = "As long as you control three or more Attractions, Spinnerette gets +2/+0 and has menace.";

export default defineCard({
  name: "Spinnerette, Arachnobat",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Performer"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${OPEN}\n${THREE}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Attraction" }, atLeast: 3 },
      grantPt: [2, 0],
      grantKeywords: ["menace"],
      text: THREE,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: OPEN,
    },
  ],
});
