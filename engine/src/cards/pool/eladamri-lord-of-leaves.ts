import { defineCard } from "../define.js";

// EDHREC rank 8782.
//
// Rulings:
//   [2008-04-01] This card only gives forestwalk to other Elf creatures. It gives shroud to all
//     other Elf permanents, including non-creatures like Prowess of the Fair.

export default defineCard({
  name: "Eladamri, Lord of Leaves",
  manaCost: "{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Other Elf creatures have forestwalk. (They can't be blocked as long as defending player controls a Forest.)\nOther Elves have shroud. (They can't be the targets of spells or abilities.)",
  static: [
    {
      affects: { scope: "all-creatures", excludeSelf: true, subtype: "Elf" },
      grantKeywords: ["forestwalk"],
      text: "Other Elf creatures have forestwalk.",
    },
    {
      // Every other Elf permanent, creature or not (the ruling).
      affects: { scope: "filter", filter: { subtype: "Elf" }, excludeSelf: true },
      grantKeywords: ["shroud"],
      text: "Other Elves have shroud.",
    },
  ],
});
