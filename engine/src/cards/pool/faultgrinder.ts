import { defineCard } from "../define.js";

// EDHREC rank 23610.

export default defineCard({
  name: "Faultgrinder",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  evoke: { cost: "{4}{R}" },
  text: "Trample\nWhen this creature enters, destroy target land.\nEvoke {4}{R} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, destroy target land.",
    },
  ],
});
