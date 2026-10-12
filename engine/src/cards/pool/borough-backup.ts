import { defineCard } from "../define.js";

export default defineCard({
  name: "Borough Backup",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Create two 3/2 white Hero creature tokens with vigilance.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  effect: { kind: "create-token", token: "Hero Token", count: 2 },
});
