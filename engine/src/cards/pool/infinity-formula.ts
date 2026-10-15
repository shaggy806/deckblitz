import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 24567.
//
// The attack trigger is the equipped creature's own (Medic's Kitesail's
// `grantsTriggered`), so its controller gains the life.
const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control.";
const GRANTED_TEXT = "Whenever this creature attacks, you gain 2 life.";
const STATIC_TEXT = `Equipped creature gets +1/+2 and has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Infinity Formula",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${STATIC_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 2],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "gain-life", amount: 2 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
