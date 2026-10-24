import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// Conspiracy: Take the Crown. EDHREC rank 24228. Melee is the `melee()`
// helper (Adriana, Captain of the Guard): the bonus counts the opponents
// attacked this combat as it resolves (the rulings).
export default defineCard({
  name: "Wings of the Guard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nMelee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)",
  triggered: [melee()],
});
