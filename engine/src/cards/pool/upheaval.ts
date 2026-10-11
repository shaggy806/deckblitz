import { defineCard } from "../define.js";

// Every permanent, every player's and tokens alike, leaves as one event (rule
// 603.10a); a token returned to a hand ceases to exist (rule 111.8), and a
// commander's owner may put it into the command zone instead (903.9b).
export default defineCard({
  name: "Upheaval",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return all permanents to their owners' hands.",
  effect: { kind: "return-to-hand-all", filter: {} },
});
