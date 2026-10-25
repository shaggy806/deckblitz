import { defineCard } from "../define.js";

// Homelands. EDHREC rank 28753.
// Rulings: the two creature cards are exiled as a cost; leaving the battlefield
// destroys every Skeleton token on the battlefield then, whoever made or
// controls it — not one still being created.
const MAKE_TEXT =
  "{B}, Exile two creature cards from your graveyard: Create a 1/1 black Skeleton creature token. It has \"{B}: Regenerate this token.\"";
const LEAVE_TEXT = "When this enchantment leaves the battlefield, destroy all Skeleton tokens. They can't be regenerated.";

export default defineCard({
  name: "Drudge Spell",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${MAKE_TEXT}\n${LEAVE_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false, exileFromGraveyard: { count: 2, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Skeleton Regenerating Token", count: 1 },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { subtype: "Skeleton", token: true },
        cantBeRegenerated: true,
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
