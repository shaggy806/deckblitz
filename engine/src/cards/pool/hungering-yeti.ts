import { defineCard } from "../define.js";

// "As long as you control a green or blue permanent, you may cast this spell
// as though it had flash" (`flashIf` with a `condition`, rule 601.3d).
export default defineCard({
  name: "Hungering Yeti",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 4,
  toughness: 4,
  flashIf: {
    condition: { kind: "controls", filter: { anyOf: [{ colors: ["G"] }, { colors: ["U"] }] }, atLeast: 1 },
  },
  text: "As long as you control a green or blue permanent, you may cast this spell as though it had flash. (You may cast it any time you could cast an instant.)",
});
