import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghoulcaller's Harvest",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  flashback: { cost: "{3}{B}{G}" },
  text: "Create X 2/2 black Zombie creature tokens with decayed, where X is half the number of creature cards in your graveyard, rounded up. (A creature with decayed can't block. When it attacks, sacrifice it at end of combat.)\nFlashback {3}{B}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: {
    kind: "create-token",
    token: "Zombie Token (Crowded Crypt)",
    // Counted as it resolves — this card is on the stack then, not in the
    // graveyard, however it was cast.
    count: { half: { countInGraveyard: { type: "creature", ownedBy: "you" } }, round: "up" },
  },
});
