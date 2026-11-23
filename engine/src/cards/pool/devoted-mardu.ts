import { defineCard } from "../define.js";
import { mobilize } from "../helpers.js";

// Playtest card (Mystery Booster 2). Devotion to Mardu is devotion to red,
// white and black together (rule 700.5): every symbol of any of them, a hybrid
// one counted once. X is counted as the mobilize trigger resolves. The
// reminder's "whenever you attack" is a joke reminder; the keyword is
// mobilize (rule 702.181a: "whenever this creature attacks").
const MOBILIZE_TEXT =
  "Mobilize X, where X is your devotion to Mardu. (Whenever you attack, create X tapped and attacking Mardudes (tapped and attacking 1/1 red Warrior creature tokens). Sacrifice them at the beginning of the next end step. I'm out of room. You remember what devotion does, right? Counts {R}, {W}, and {B}!)";

export default defineCard({
  name: "Devoted Mardu",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 5,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${MOBILIZE_TEXT}`,
  triggered: [{ ...mobilize({ devotionTo: ["R", "W", "B"] }), text: MOBILIZE_TEXT }],
});
