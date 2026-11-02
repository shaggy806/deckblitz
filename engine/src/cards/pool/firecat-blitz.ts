import { defineCard } from "../define.js";

// Flashback's X comes from its sacrifice alone: its mana is {R}{R}, and X is
// announced as it's cast (rule 107.3a), then that many Mountains are chosen as
// the cost is paid. The spell reads the same X either way.
export default defineCard({
  name: "Firecat Blitz",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Create X 1/1 red Elemental Cat creature tokens with haste. Exile them at the beginning of the next end step.\n" +
    "Flashback—{R}{R}, Sacrifice X Mountains. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: { kind: "create-token", token: "Elemental Cat Token", count: "x", exileAtEndStep: true },
  flashback: { cost: "{R}{R}", sacrifice: { filter: { subtype: "Mountain" }, count: "x" } },
});
