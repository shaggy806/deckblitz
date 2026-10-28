import { defineCard } from "../define.js";

// EDHREC rank 3760.
//
// The colour is chosen as it resolves, then every white creature you control
// then gains it (rule 611.2c — one arriving later doesn't).
export default defineCard({
  name: "Brave the Elements",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose a color. White creatures you control gain protection from the chosen color until end of turn.",
  targets: [],
  effect: {
    kind: "grant-protection",
    filter: { type: "creature", colors: ["W"], controlledBy: "you" },
    from: { choose: "color" },
    duration: "end-of-turn",
  },
});
