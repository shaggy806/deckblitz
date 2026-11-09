import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const ENTER_TEXT = "When this enchantment enters, create a Blood token for each opponent you have.";
const GRANTED_TEXT = "Equipped creature gets +2/+0";
const STATIC_TEXT = `Blood tokens you control are Equipment in addition to their other types and have "${GRANTED_TEXT}" and equip {2}.`;

export default defineCard({
  name: "Arterial Alchemy",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENTER_TEXT} (It's an artifact with "{1}, {T}, Discard a card, Sacrifice this token: Draw a card.")\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: { countPlayers: "each-opponent" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Blood", controlledBy: "you", token: true } },
      addSubtypes: ["Equipment"],
      grantsStatic: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: GRANTED_TEXT }],
      grantsActivated: [equip("{2}")],
      text: STATIC_TEXT,
    },
  ],
});
