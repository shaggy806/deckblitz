import { defineCard } from "../define.js";

export default defineCard({
  name: "Canopy Claws",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  flashback: { cost: "{G}" },
  text: "Target creature loses flying until end of turn.\nFlashback {G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
});
