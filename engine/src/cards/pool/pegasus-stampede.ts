import { defineCard } from "../define.js";

export default defineCard({
  name: "Pegasus Stampede",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  kicker: { cost: "", keyword: "buyback", also: { text: "Sacrifice a land", sacrifice: { filter: { type: "land" }, count: 1 } } },
  text: "Buyback—Sacrifice a land. (You may sacrifice a land in addition to any other costs as you cast this spell. If you do, put this card into your hand as it resolves.)\nCreate a 1/1 white Pegasus creature token with flying.",
  effect: { kind: "create-token", token: "Pegasus Token", count: 1 },
});
