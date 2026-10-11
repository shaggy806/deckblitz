import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Banned in Commander; in the pool for casual play.

export default defineCard({
  name: "Mox Emerald",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {G}.",
  activated: [addManaAbility({ mana: "G", text: "{T}: Add {G}." })],
});
