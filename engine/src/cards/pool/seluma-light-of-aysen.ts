import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Rulebreaker is a deckbuilding rule only
// (`rulebreaker`, read by deck-validation.ts).
const RULEBREAKER_TEXT =
  "Rulebreaker — A deck with this commander can have Angel cards of any color identity and any basic land cards.";
const DAMAGE_TEXT =
  "Whenever Seluma deals combat damage to a player, return target Angel creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Seluma, Light of Aysen",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `${RULEBREAKER_TEXT}\nFlying\n${DAMAGE_TEXT}`,
  rulebreaker: {
    anyIdentity: [{ subtypes: ["Angel"] }, { supertypes: ["basic"], types: ["land"] }],
  },
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", subtype: "Angel" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
