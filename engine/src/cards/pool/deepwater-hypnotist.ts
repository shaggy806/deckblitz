import { defineCard } from "../define.js";

// EDHREC rank 27175. Inspired: the untap trigger, targeting as it's put on
// the stack (with the upkeep's triggers when it untaps in the untap step).
const INSPIRED_TEXT =
  "Inspired — Whenever this creature becomes untapped, target creature an opponent controls gets -3/-0 until end of turn.";

export default defineCard({
  name: "Deepwater Hypnotist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  text: INSPIRED_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: INSPIRED_TEXT,
    },
  ],
});
