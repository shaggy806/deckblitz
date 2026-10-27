import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 11851. Fifth Dawn. Chromatic Lantern's grant.

const GRANT_TEXT = "Lands you control have \"{T}: Add one mana of any color.\"";

export default defineCard({
  name: "Joiner Adept",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 1,
  text: GRANT_TEXT,
  static: [
    {
      affects: { scope: "lands-you-control" },
      grantsActivated: [addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." })],
      text: GRANT_TEXT,
    },
  ],
});
