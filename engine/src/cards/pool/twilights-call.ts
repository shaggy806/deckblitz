import { defineCard } from "../define.js";

// EDHREC rank 14435.

export default defineCard({
  name: "Twilight's Call",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "flash", flash: true },
  text: "You may cast this spell as though it had flash if you pay {2} more to cast it. (You may cast it any time you could cast an instant.)\nEach player returns all creature cards from their graveyard to the battlefield.",
  effect: {
    kind: "return-from-graveyard",
    from: "each-graveyard",
    filter: { type: "creature" },
    destination: "battlefield",
    count: "all",
  },
});
