import { defineCard } from "../define.js";
import { landUntilCastFromExile } from "../helpers.js";

const EXILE = landUntilCastFromExile(["B", "R", "G"]);

export default defineCard({
  name: "Masked Bandits",
  manaCost: "{3}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Raccoon", "Rogue"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance", "menace"],
  text: `Vigilance\nMenace (This creature can't be blocked except by two or more creatures.)\n${EXILE.text}`,
  activated: [EXILE],
});
