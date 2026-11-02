import { defineCard } from "../define.js";

export default defineCard({
  name: "Rout",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "flash", flash: true },
  text: "You may cast this spell as though it had flash if you pay {2} more to cast it. (You may cast it any time you could cast an instant.)\nDestroy all creatures. They can't be regenerated.",
  effect: { kind: "destroy-all", filter: { type: "creature" }, cantBeRegenerated: true },
});
