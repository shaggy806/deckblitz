import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 20270.

export default defineCard({
  name: "Hibernation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return all green permanents to their owners' hands.",
  targets: [],
  effect: { kind: "return-to-hand-all", filter: { colors: ["G"] } },
});
