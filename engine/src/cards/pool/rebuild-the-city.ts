import { defineCard } from "../define.js";

// Rulings: the copies' "as this land enters" abilities work, each token making
// its own choice (`Game.createTokenCopy`, rule 614.12a), and a land that enters
// tapped has its copies enter tapped too.
export default defineCard({
  name: "Rebuild the City",
  manaCost: "{3}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["sorcery"],
  text:
    "Choose target land. Create three tokens that are copies of it, except they're 3/3 creatures in addition to their other types and they have vigilance and menace. (They're affected by summoning sickness.)",
  targets: ["land"],
  effect: {
    kind: "create-token-copy",
    of: 0,
    count: 3,
    who: "you",
    exceptions: { addTypes: ["creature"], power: 3, toughness: 3, keywords: ["vigilance", "menace"] },
  },
});
