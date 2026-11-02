import { defineCard } from "../define.js";

export default defineCard({
  name: "Saproling Symbiosis",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "flash", flash: true },
  text: "You may cast this spell as though it had flash if you pay {2} more to cast it. (You may cast it any time you could cast an instant.)\nCreate a 1/1 green Saproling creature token for each creature you control.",
  effect: { kind: "create-token", token: "Saproling Token", count: { countOf: { type: "creature", controlledBy: "you" } } },
});
