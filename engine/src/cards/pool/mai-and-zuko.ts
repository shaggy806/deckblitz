import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 10643.

const FLASH_TEXT = "You may cast Ally spells and artifact spells as though they had flash.";

export default defineCard({
  name: "Mai and Zuko",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Ally"],
  power: 3,
  toughness: 5,
  text: `Firebending 3\n${FLASH_TEXT}`,
  triggered: [firebending(3)],
  static: [
    {
      affects: { scope: "self" },
      castAsThoughFlash: { anyOf: [{ subtype: "Ally" }, { type: "artifact" }] },
      text: FLASH_TEXT,
    },
  ],
});
