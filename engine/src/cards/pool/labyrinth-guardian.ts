import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// EDHREC rank 28839. Amonkhet. Dream Strix's trigger: an Aura spell targets
// what it will enchant, and it's sacrificed even if that spell is countered
// (the rulings).
const TARGET_TEXT = "When this creature becomes the target of a spell, sacrifice it.";
const EMBALM_TEXT =
  "Embalm {3}{U} ({3}{U}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Illusion Warrior with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Labyrinth Guardian",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion", "Warrior"],
  power: 2,
  toughness: 3,
  text: `${TARGET_TEXT}\n${EMBALM_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
  activated: [embalmAbility("{3}{U}", EMBALM_TEXT)],
});
