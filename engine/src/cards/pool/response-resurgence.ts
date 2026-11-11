import { defineCard } from "../define.js";

// Guilds of Ravnica (GRN). EDHREC rank 5590. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both types. Never
// cast itself; a spell is one half or the other (response.ts, resurgence.ts).
const FACES = ["Response // Resurgence", "Response", "Resurgence"];

export default defineCard({
  name: "Response // Resurgence",
  manaCost: "{R/W}{R/W}{3}{R}{W}",
  colors: ["W", "R"],
  types: ["instant", "sorcery"],
  text: "Response deals 5 damage to target attacking or blocking creature.\n//\nCreatures you control gain first strike and vigilance until end of turn. After this main phase, there is an additional combat phase followed by an additional main phase.",
  faces: FACES,
  split: true,
});
