import { defineCard } from "../define.js";

// EDHREC rank 11995. Iroh, Tea Master's counted token.

export default defineCard({
  name: "Match the Odds",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Create a 1/1 white Ally creature token. Put a +1/+1 counter on it for each creature your opponents control.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Ally Token",
    count: 1,
    thenCounters: { kind: "+1/+1", amount: { countOf: { type: "creature", controlledBy: "opponent" } } },
  },
});
