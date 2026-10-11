import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 13931.

const LOTUS_TEXT =
  "Whenever you gain life, create a colorless artifact token named Lotus with \"{T}, Sacrifice this token: Add three mana of any one color.\" " +
  "This ability triggers only once each turn.";

export default defineCard({
  name: "Kwia Vigorbloom",
  manaCost: "{3}{G}{W}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Sphinx"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "vigilance", "lifelink"],
  text: `Flying, vigilance, lifelink, ward {2}\n${LOTUS_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Lotus", count: 1 },
      resolve: null,
      text: LOTUS_TEXT,
      oncePerTurn: true,
    },
  ],
});
