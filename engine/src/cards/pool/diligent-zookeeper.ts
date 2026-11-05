import { defineCard } from "../define.js";

const TEXT = "Each non-Human creature you control gets +1/+1 for each of its creature types, to a maximum of 10.";

export default defineCard({
  name: "Diligent Zookeeper",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen", "Ally"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", notSubtypes: ["Human"] } },
      grantPtPerCount: { ofAffected: "creature-types", max: 10, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
