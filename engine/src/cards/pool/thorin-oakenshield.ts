import { defineCard } from "../define.js";
import { STORIED_TEXT, ward } from "../helpers.js";

const WARD_TEXT = "As long as you have an enduring story, artifacts and creatures you control have ward {1}.";

export default defineCard({
  name: "Thorin Oakenshield",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Noble"],
  power: 3,
  toughness: 2,
  keywords: ["trample", "storied"],
  text: `Trample\n${STORIED_TEXT}\n${WARD_TEXT}`,
  static: [
    {
      // Thorin among them (Bronze Guardian's granted ward).
      affects: { scope: "filter", filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
      condition: { kind: "enduring-story" },
      grantsTriggered: [ward({ mana: "{1}" })],
      text: WARD_TEXT,
    },
  ],
});
