import { defineCard } from "../define.js";

// Rule 305.7: the land loses its other land types and its rules-text
// abilities and has "{T}: Add {U}" — for as long as this creature remains on
// the battlefield; if it has already left, nothing happens (the ruling,
// rule 611.2b).
export default defineCard({
  name: "Tide Shaper",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  kicker: { cost: "{1}" },
  text: "Kicker {1} (You may pay an additional {1} as you cast this spell.)\nWhen this creature enters, if it was kicked, target land becomes an Island for as long as this creature remains on the battlefield.\nThis creature gets +1/+1 as long as an opponent controls an Island.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Island"], duration: "while-source" },
      resolve: null,
      text: "When this creature enters, if it was kicked, target land becomes an Island for as long as this creature remains on the battlefield.",
      condition: { kind: "self-kicked" },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "opponent-controls", filter: { subtype: "Island" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as an opponent controls an Island.",
    },
  ],
});
