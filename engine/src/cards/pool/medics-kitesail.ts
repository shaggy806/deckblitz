import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 24632.

const GRANTED_TEXT = "Whenever this creature attacks, you gain 1 life.";
const STATIC_TEXT = `Equipped creature gets +1/+0 and has flying and "${GRANTED_TEXT}"`;

// The attack trigger is the equipped creature's own (Biorganic Carapace's
// `grantsTriggered`), so its controller gains the life.
export default defineCard({
  name: "Medic's Kitesail",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["flying"],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "gain-life", amount: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
