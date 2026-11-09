import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const GRANTED_TEXT = "Equipped creature gets +1/+0";
const STATIC_TEXT = `Noncreature, non-Equipment artifacts you control are Equipment in addition to their other types and have "${GRANTED_TEXT}" and equip {1}.`;

export default defineCard({
  name: "Dan Lewis",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  pairing: { kind: "doctors-companion" },
  text: `${STATIC_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", notTypes: ["creature"], notSubtypes: ["Equipment"], controlledBy: "you" } },
      addSubtypes: ["Equipment"],
      grantsStatic: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: GRANTED_TEXT }],
      grantsActivated: [equip("{1}")],
      text: STATIC_TEXT,
    },
  ],
});
