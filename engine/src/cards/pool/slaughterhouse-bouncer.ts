import { defineCard } from "../define.js";

// Dissension. EDHREC rank 31380. Hellbent as an intervening if (rule 603.4):
// checked as it dies and again as it resolves.

const TEXT =
  "Hellbent — When this creature dies, if you have no cards in hand, target creature gets -3/-3 until end of turn.";

export default defineCard({
  name: "Slaughterhouse Bouncer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
