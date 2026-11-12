import { defineCard } from "../define.js";

// EDHREC rank 10459.

const ENTER_TEXT = "When this enchantment enters, create a 1/1 white Ally creature token.";
const ANTHEM_TEXT = "Allies you control get +1/+1.";

export default defineCard({
  name: "Allied Teamwork",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Ally Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "creatures-you-control", subtype: "Ally" }, grantPt: [1, 1], text: ANTHEM_TEXT }],
});
