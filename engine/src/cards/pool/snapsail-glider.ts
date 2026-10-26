import { defineCard } from "../define.js";

// EDHREC rank 28803. Metalcraft as a `controls` count with `countsSelf`: a
// static's `metalcraft` scan leaves its own permanent out, and the Glider is
// an artifact that counts toward its own three.

const TEXT = "Metalcraft — This creature has flying as long as you control three or more artifacts.";

export default defineCard({
  name: "Snapsail Glider",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 3, countsSelf: true },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
