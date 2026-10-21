import { defineCard } from "../define.js";

// EDHREC rank 23895. Two separate statics, so an artifact enchantment
// satisfies both (the ruling). `countsSelf`: "you control an artifact"
// includes this creature, should it become one.

const ARTIFACT_TEXT = "This creature gets +1/+1 as long as you control an artifact.";
const ENCHANTMENT_TEXT = "This creature gets +1/+1 as long as you control an enchantment.";

export default defineCard({
  name: "Shinechaser",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ARTIFACT_TEXT}\n${ENCHANTMENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      text: ARTIFACT_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      text: ENCHANTMENT_TEXT,
    },
  ],
});
