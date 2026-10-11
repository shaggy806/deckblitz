import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Banned in Commander; in the pool for casual play.

export default defineCard({
  name: "Mox Jet",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {B}.",
  activated: [addManaAbility({ mana: "B", text: "{T}: Add {B}." })],
});
