import { defineCard } from "../define.js";

const ENTER = "When this creature enters, create a 3/3 colorless Illusion artifact creature token.";
const REPLACE =
  "If one or more tokens would be created under your control, that many 3/3 colorless Illusion artifact creature tokens are created instead.";

export default defineCard({
  name: "Holo-Engineer",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: `${ENTER}\n${REPLACE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Illusion Token 3/3 artifact", count: 1 },
      resolve: null,
      text: ENTER,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", tokensInstead: "Illusion Token 3/3 artifact" },
      text: REPLACE,
    },
  ],
});
