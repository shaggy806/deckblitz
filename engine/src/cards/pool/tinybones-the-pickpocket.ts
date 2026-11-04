import { defineCard } from "../define.js";

// The card is cast as the trigger resolves or not at all, its
// type's timing ignored (the ruling); "mana of any type" is for that cast alone
// (rule 118.14).
const COMBAT_TEXT =
  "Whenever Tinybones deals combat damage to a player, you may cast target nonland permanent card from that player's graveyard, and mana of any type can be spent to cast that spell.";

export default defineCard({
  name: "Tinybones, the Pickpocket",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Rogue"],
  supertypes: ["legendary"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "trigger-player",
          filter: { notTypes: ["land", "instant", "sorcery"] },
        },
      ],
      effect: { kind: "cast-now", target: 0, spendAs: "any-type" },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
