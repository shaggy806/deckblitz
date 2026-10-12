import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// Fire Nation Attacks's Soldier token.

export default defineCard({
  name: "Soldier Token (Fire Nation Attacks)",
  art: "2de43b03-9ac5-4292-ab29-2dc6210ef3d9",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Soldier"],
  power: 2,
  toughness: 2,
  text: "Firebending 1 (Whenever this token attacks, add {R}. This mana lasts until end of combat.)",
  triggered: [
    firebending(1, "Firebending 1 (Whenever this token attacks, add {R}. This mana lasts until end of combat.)"),
  ],
});
