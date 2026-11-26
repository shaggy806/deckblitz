import { defineCard } from "../define.js";

// EDHREC rank 20704.
//
// "Tap lands you don't control for mana": the caster may activate the mana
// abilities with {T} in their cost of lands other players control, by hand
// with priority (`tapsLandsYouDontControl`); the mana is theirs, spent only on
// spells. A land with a spend clause of its own keeps it, narrowed to spells.

const TEXT =
  "Until end of turn, you may tap lands you don't control for mana. Spend this mana only to cast spells.";

export default defineCard({
  name: "Piracy",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "player-effect",
    duration: "end-of-turn",
    tapsLandsYouDontControl: { spell: {}, text: "Spend this mana only to cast spells." },
  },
});
