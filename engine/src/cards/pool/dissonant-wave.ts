import { defineCard } from "../define.js";

// Emerald Dragon's Adventure. "From a noncreature source" reads the source
// as it is, or as it last existed on the battlefield if it has left
// (`sourceFilter`, rule 113.7a). A mana ability can't be targeted (rule
// 605.3b).
export default defineCard({
  name: "Dissonant Wave",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Counter target activated or triggered ability from a noncreature source. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "ability", sourceFilter: { notTypes: ["creature"] } }],
  effect: { kind: "counter", target: 0 },
  faces: ["Emerald Dragon", "Dissonant Wave"],
  adventure: true,
});
