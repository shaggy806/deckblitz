import { defineCard } from "../define.js";

// EDHREC rank 27545.
//
// "Lands target player controls": the filter's "you" is the target player
// (`controlledByTarget`, Turnabout's shape).

const ETB = "When this creature enters, tap all lands target player controls.";

export default defineCard({
  name: "Gulf Squid",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Squid", "Beast"],
  power: 2,
  toughness: 2,
  text: ETB,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "tap-all", filter: { type: "land", controlledBy: "you" }, controlledByTarget: 0 },
      resolve: null,
      text: ETB,
    },
  ],
});
