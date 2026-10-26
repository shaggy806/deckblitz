import { defineCard } from "../define.js";

export default defineCard({
  name: "Mystic Speculation",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "buyback" },
  text: "Buyback {2} (You may pay an additional {2} as you cast this spell. If you do, put this card into your hand as it resolves.)\nScry 3. (Look at the top three cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  effect: { kind: "scry", amount: 3 },
});
