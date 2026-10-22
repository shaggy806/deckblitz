import { defineCard } from "../define.js";
import { eternalizeAbility } from "../helpers.js";

const ETERNALIZE_TEXT =
  "Eternalize {4}{U}{U} ({4}{U}{U}, Exile this card from your graveyard: Create a token that's a copy of it, " +
  "except it's a 4/4 black Zombie Human Warrior with no mana cost. Eternalize only as a sorcery.)";

export default defineCard({
  name: "Proven Combatant",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: ETERNALIZE_TEXT,
  activated: [eternalizeAbility("{4}{U}{U}", ETERNALIZE_TEXT)],
});
