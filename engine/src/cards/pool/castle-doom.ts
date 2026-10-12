import { defineCard } from "../define.js";

// EDHREC rank 8394.

const ARTIFACT_MANA_TEXT = "{T}: Add one mana of any color. Spend this mana only to cast an artifact spell.";
const DOOMBOT_TEXT =
  "{3}, {T}, Sacrifice an artifact: Create a 3/3 colorless Robot Villain artifact creature token named Doombot. Activate only as a sorcery.";

export default defineCard({
  name: "Castle Doom",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${ARTIFACT_MANA_TEXT}\n${DOOMBOT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: { spell: { type: "artifact" }, text: "Spend this mana only to cast an artifact spell." },
      },
      resolve: null,
      text: ARTIFACT_MANA_TEXT,
    },
    {
      cost: { mana: "{3}", tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "create-token", token: "Doombot", count: 1 },
      resolve: null,
      text: DOOMBOT_TEXT,
      sorcerySpeed: true,
    },
  ],
});
