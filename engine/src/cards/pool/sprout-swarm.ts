import { defineCard } from "../define.js";

export default defineCard({
  name: "Sprout Swarm",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "buyback" },
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nBuyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nCreate a 1/1 green Saproling creature token.",
  effect: { kind: "create-token", token: "Saproling Token", count: 1 },
});
