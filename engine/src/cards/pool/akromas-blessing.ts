import { defineCard } from "../define.js";

// EDHREC rank 13357.
//
// The colour is chosen as it resolves and feeds one grant: the creatures you
// control as it resolves (rule 611.2c).
export default defineCard({
  name: "Akroma's Blessing",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{W}" },
  text: "Choose a color. Creatures you control gain protection from the chosen color until end of turn.\nCycling {W} ({W}, Discard this card: Draw a card.)",
  targets: [],
  effect: {
    kind: "grant-protection",
    filter: { type: "creature", controlledBy: "you" },
    from: { choose: "color" },
    duration: "end-of-turn",
  },
});
