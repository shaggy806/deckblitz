import { defineCard } from "../define.js";

export default defineCard({
  name: "Mesmerizing Benthid",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 4,
  toughness: 5,
  text: "When this creature enters, create two 0/2 blue Illusion creature tokens with \"Whenever this token blocks a creature, that creature doesn't untap during its controller's next untap step.\"\nThis creature has hexproof as long as you control an Illusion.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Illusion Token (Freezing Blocker)", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 0/2 blue Illusion creature tokens with \"Whenever this token blocks a creature, that creature doesn't untap during its controller's next untap step.\"",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Illusion" }, atLeast: 1 },
      grantKeywords: ["hexproof"],
      text: "This creature has hexproof as long as you control an Illusion.",
    },
  ],
});
