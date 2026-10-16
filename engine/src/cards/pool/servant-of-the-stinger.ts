import { defineCard } from "../define.js";

// EDHREC rank 10447.
//
// "If you've committed a crime this turn" is an intervening if (rule 603.4),
// checked as the damage is dealt and again as the ability resolves. The
// search happens only if the sacrifice did (`sacrifice-source`'s `then`).

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, if you've committed a crime this turn, you may sacrifice this creature. If you do, search your library for a card, put it into your hand, then shuffle.";

export default defineCard({
  name: "Servant of the Stinger",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${DAMAGE_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "committed-crime-this-turn" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Servant of the Stinger to search your library for a card?",
        effect: {
          kind: "sacrifice-source",
          then: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
