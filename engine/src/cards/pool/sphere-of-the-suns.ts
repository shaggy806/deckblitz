import { defineCard } from "../define.js";

// EDHREC rank 14270.

const ENTERS_TEXT = "This artifact enters tapped and with three charge counters on it.";
const MANA_TEXT = "{T}, Remove a charge counter from this artifact: Add one mana of any color.";

export default defineCard({
  name: "Sphere of the Suns",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS_TEXT}\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true, counters: { kind: "charge", amount: 3 } },
      text: ENTERS_TEXT,
    },
  ],
});
