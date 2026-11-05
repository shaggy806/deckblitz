import { defineCard } from "../define.js";

// Guilds of Ravnica (GRN). EDHREC rank 12448.

const FACES = ["Invert // Invent", "Invert", "Invent"];
const INVERT_TEXT = "Switch the power and toughness of each of up to two target creatures until end of turn.";
const INVENT_TEXT =
  "Search your library for an instant card and/or a sorcery card, reveal them, put them into your hand, then shuffle.";

// The whole card: every zone but the stack (rule 709.4), mana value 7 there.
// Casting offers each half on its own (invert.ts, invent.ts).
export default defineCard({
  name: "Invert // Invent",
  manaCost: "{U/R}{4}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: `${INVERT_TEXT}\n//\n${INVENT_TEXT}`,
  faces: FACES,
  split: true,
});
