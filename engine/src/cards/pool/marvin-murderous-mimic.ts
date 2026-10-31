import { defineCard } from "../define.js";

// The creatures you control with a name other than Marvin's, as each is now
// (rule 201.2a): a face-down one has no name, so it counts — with only the
// abilities granted to it to give (rule 708.2).
const GRANT_TEXT =
  "Marvin has all activated abilities of creatures you control that don't have the same name as this creature.";

export default defineCard({
  name: "Marvin, Murderous Mimic",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Toy"],
  power: 2,
  toughness: 2,
  text: GRANT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: {
        zone: "battlefield",
        filter: { type: "creature", controlledBy: "you", sameNameAsSource: false },
      },
      text: GRANT_TEXT,
    },
  ],
});
