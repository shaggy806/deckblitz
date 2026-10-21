import { defineCard } from "../define.js";

const FACES = ["Warrant // Warden", "Warrant", "Warden"];
const WARRANT_TEXT = "Put target attacking or blocking creature on top of its owner's library.";
const WARDEN_TEXT = "Create a 4/4 white and blue Sphinx creature token with flying and vigilance.";

// The whole card: every zone but the stack (rule 709.4) — both names, the
// combined mana cost (mana value 7), an instant and a sorcery. Never cast
// itself; a spell is one half or the other (warrant.ts, warden.ts).
export default defineCard({
  name: "Warrant // Warden",
  manaCost: "{W/U}{W/U}{3}{W}{U}",
  colors: ["W", "U"],
  types: ["instant", "sorcery"],
  text: `${WARRANT_TEXT}\n//\n${WARDEN_TEXT}`,
  faces: FACES,
  split: true,
});
