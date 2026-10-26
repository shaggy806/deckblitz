import { defineCard } from "../define.js";

// EDHREC rank 10951.
// Blade Splicer's shape, with flying for Golems.

const MAKE = "When this creature enters, create a 3/3 colorless Phyrexian Golem artifact creature token.";
const FLYING = "Golem creatures you control have flying.";

export default defineCard({
  name: "Wing Splicer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Artificer"],
  power: 1,
  toughness: 1,
  text: `${MAKE}\n${FLYING}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 1 },
      resolve: null,
      text: MAKE,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Golem" },
      grantKeywords: ["flying"],
      text: FLYING,
    },
  ],
});
