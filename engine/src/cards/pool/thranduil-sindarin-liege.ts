import { defineCard } from "../define.js";

// An adventurer card (rule 715): its Adventure is Silvan Rally.
const LORD_TEXT = "Other Elves you control get +1/+1.";
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, create a 1/1 green Elf creature token.";

export default defineCard({
  name: "Thranduil, Sindarin Liege",
  manaCost: "{2}{G/U}{G/U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 2,
  toughness: 3,
  text: `${LORD_TEXT}\n${LANDFALL_TEXT}`,
  faces: ["Thranduil, Sindarin Liege", "Silvan Rally"],
  adventure: true,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Elf" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Elf Token", count: 1 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
