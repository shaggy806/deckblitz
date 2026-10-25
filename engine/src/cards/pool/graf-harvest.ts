import { defineCard } from "../define.js";

const MENACE_TEXT = "Zombies you control have menace.";
const TOKEN_TEXT = "{3}{B}, Exile a creature card from your graveyard: Create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Graf Harvest",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${MENACE_TEXT} (They can't be blocked except by two or more creatures.)\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Zombie", controlledBy: "you" } },
      grantKeywords: ["menace"],
      text: MENACE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
