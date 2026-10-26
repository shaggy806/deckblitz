import { defineCard } from "../define.js";

// EDHREC rank 32045.

export default defineCard({
  name: "Hedge Troll",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Cleric"],
  power: 2,
  toughness: 2,
  text: "This creature gets +1/+1 as long as you control a Plains.\n{W}: Regenerate this creature.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control a Plains.",
    },
  ],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{W}: Regenerate this creature.",
    },
  ],
});
