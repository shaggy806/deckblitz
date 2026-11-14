import { ODD_OR_EVEN } from "../helpers.js";
import { defineCard } from "../define.js";

// Protection from every mana value of the chosen quality (zero is even), read
// off the source's own mana value — a spell's with its X (the rulings). With no
// quality chosen, nothing matches.

const PROTECTION_TEXT = "This creature has protection from each mana value of the chosen quality.";

export default defineCard({
  name: "Lavabrink Venturer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: `As this creature enters, choose odd or even. (Zero is even.)\n${PROTECTION_TEXT}`,
  chooseOnEnter: ODD_OR_EVEN,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { manaValueParity: "chosen" } },
      text: PROTECTION_TEXT,
    },
  ],
});
