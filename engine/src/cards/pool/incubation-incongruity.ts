import { defineCard } from "../define.js";

const FACES = ["Incubation // Incongruity", "Incubation", "Incongruity"];
const INCUBATION_TEXT =
  "Look at the top five cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const INCONGRUITY_TEXT =
  "Exile target creature. That creature's controller creates a 3/3 green Frog Lizard creature token.";

// The whole card: every zone but the stack (rule 709.4) — both names, the
// combined mana cost (mana value 4), a sorcery and an instant. Never cast
// itself; a spell is one half or the other (incubation.ts, incongruity.ts).
export default defineCard({
  name: "Incubation // Incongruity",
  manaCost: "{G/U}{1}{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery", "instant"],
  text: `${INCUBATION_TEXT}\n//\n${INCONGRUITY_TEXT}`,
  faces: FACES,
  split: true,
});
