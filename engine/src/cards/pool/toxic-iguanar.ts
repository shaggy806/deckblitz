import { defineCard } from "../define.js";

// Conflux (CON). EDHREC rank 28877. "A green permanent" includes the Iguanar
// itself should it become green (`countsSelf` — a static leaves its own
// permanent out otherwise).
const TEXT = "This creature has deathtouch as long as you control a green permanent.";

export default defineCard({
  name: "Toxic Iguanar",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 1,
  toughness: 1,
  text: `${TEXT} (Any amount of damage a creature with deathtouch deals to a creature is enough to destroy it.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { colors: ["G"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["deathtouch"],
      text: TEXT,
    },
  ],
});
