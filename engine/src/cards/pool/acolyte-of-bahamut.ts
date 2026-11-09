import { defineCard } from "../define.js";

// The granted ability works from each commander that has it, "you" being that
// commander's controller. "The first Dragon spell each turn" is counted from
// what you've cast, so each copy of the ability reduces only that first spell:
// with two commanders the first Dragon costs {4} less (the ruling).
const GRANTED_TEXT = "The first Dragon spell you cast each turn costs {2} less to cast.";
const STATIC_TEXT = `Commander creatures you own have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Acolyte of Bahamut",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: STATIC_TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsStatic: [
        {
          affects: { scope: "self" },
          costModification: { applies: { subtype: "Dragon", controlledBy: "you" }, reduceGeneric: 2, when: { firstEachTurn: true } },
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
