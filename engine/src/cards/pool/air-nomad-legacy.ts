import { defineCard } from "../define.js";

// EDHREC rank 13103.

const ENTERS_TEXT = "When this enchantment enters, create a Clue token.";
const ANTHEM_TEXT = "Creatures you control with flying get +1/+1.";

export default defineCard({
  name: "Air Nomad Legacy",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT} (It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [{ affects: { scope: "creatures-you-control", withKeyword: "flying" }, grantPt: [1, 1], text: ANTHEM_TEXT }],
});
