import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 10065.
// Makes Phyrexian Mite → use "Phyrexian Mite Token".

const PUMP_TEXT = "Equipped creature gets +2/+0.";
const ATTACK_TEXT =
  'Whenever equipped creature attacks, create a 1/1 colorless Phyrexian Mite artifact creature token with toxic 1 and "This token can\'t block." (Players dealt combat damage by it also get a poison counter.)';

export default defineCard({
  name: "Infested Fleshcutter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${ATTACK_TEXT}\nEquip {2}{W}`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Mite Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [equip("{2}{W}")],
});
