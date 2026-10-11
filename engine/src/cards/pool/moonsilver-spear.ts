import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 6748.
//
// The Angel is the Spear's controller's, whoever controls the equipped
// creature, and it doesn't enter attacking.
const STRIKE_TEXT = "Equipped creature has first strike.";
const ATTACK_TEXT = "Whenever equipped creature attacks, create a 4/4 white Angel creature token with flying.";

export default defineCard({
  name: "Moonsilver Spear",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STRIKE_TEXT}\n${ATTACK_TEXT}\nEquip {4}`,
  static: [{ affects: { scope: "attached" }, grantKeywords: ["first-strike"], text: STRIKE_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "4/4 Angel Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
