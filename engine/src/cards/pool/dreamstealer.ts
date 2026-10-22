import { defineCard } from "../define.js";
import { eternalizeAbility } from "../helpers.js";

// "That many" is the combat damage it dealt (the trigger's value).
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, that player discards that many cards.";
const ETERNALIZE_TEXT =
  "Eternalize {4}{B}{B} ({4}{B}{B}, Exile this card from your graveyard: Create a token that's a copy of it, " +
  "except it's a 4/4 black Zombie Human Wizard with no mana cost. Eternalize only as a sorcery.)";

export default defineCard({
  name: "Dreamstealer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${DAMAGE_TEXT}\n${ETERNALIZE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [eternalizeAbility("{4}{B}{B}", ETERNALIZE_TEXT)],
});
