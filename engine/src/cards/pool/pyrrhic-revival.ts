import { defineCard } from "../define.js";

// All at once, each with its counter as it enters, so its enters triggers see it.

export default defineCard({
  name: "Pyrrhic Revival",
  manaCost: "{3}{W/B}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Each player returns each creature card from their graveyard to the battlefield with an additional -1/-1 counter on it.",
  effect: {
    kind: "return-from-graveyard",
    from: "each-graveyard",
    filter: { type: "creature" },
    destination: "battlefield",
    withCounters: { kind: "-1/-1", amount: 1 },
    count: "all",
  },
});
