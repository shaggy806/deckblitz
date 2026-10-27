import { defineCard } from "../define.js";

const LORD_TEXT = "Other Barbarian creatures get +1/+1.";
const PUMP_TEXT = "{R}: Another target Barbarian creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Balthor the Stout",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Barbarian"],
  power: 2,
  toughness: 2,
  text: `${LORD_TEXT}\n${PUMP_TEXT}`,
  static: [
    { affects: { scope: "all-creatures", excludeSelf: true, subtype: "Barbarian" }, grantPt: [1, 1], text: LORD_TEXT },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", subtype: "Barbarian" } } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
