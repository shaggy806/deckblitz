import { defineCard } from "../define.js";

// EDHREC rank 7938.

const ATTACK_TEXT =
  "Whenever this creature attacks, target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to that card's mana cost.";

export default defineCard({
  name: "Sphinx of Forgotten Lore",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nFlying\n${ATTACK_TEXT} (You may cast that card from your graveyard for its flashback cost. Then exile it.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["instant-or-sorcery-in-your-graveyard"],
      effect: { kind: "grant-flashback", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
