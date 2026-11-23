import { defineCard } from "../define.js";

// Playtest card. The card is picked at random as the trigger resolves, then
// Garth One-Eye's copy made outside the game (rule 707.13) and offered free.
// A copy not cast is gone.

const CHARMS = ["Piracy Charm", "Sapphire Charm", "Trickery Charm", "Vision Charm"] as const;
const TEXT =
  "When Really Charming Prince enters the battlefield, choose one of the following four cards at random: Piracy Charm, Sapphire Charm, Trickery Charm, and Vision Charm. You may create a copy of the chosen card and cast that copy without paying its mana cost.";

export default defineCard({
  name: "Really Charming Prince",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Noble"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        random: true,
        modes: CHARMS.map((name) => ({
          text: name,
          effect: { kind: "cast-now", copyOfCardNamed: name, copyOutsideTheGame: true, free: true },
        })),
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
