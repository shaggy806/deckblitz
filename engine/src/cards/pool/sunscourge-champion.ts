import { defineCard } from "../define.js";
import { eternalizeAbility } from "../helpers.js";

// EDHREC rank 25385.
//
// Rulings:
//   Several cards have an eternalize cost that includes "Discard a card." You
//   can't discard the card with eternalize to pay its own cost because the
//   card has to be in your graveyard to begin activating its eternalize
//   ability.
//   If Sunscourge Champion leaves the battlefield before its triggered ability
//   resolves, use its power as it last existed on the battlefield to
//   determine how much life to gain.
//
// Eternalize with a discard added to its cost: `eternalizeAbility`'s
// ability, its cost the mana and a discard.
const ENTERS = "When this creature enters, you gain life equal to its power.";
const ETERNALIZE_TEXT =
  "Eternalize—{2}{W}{W}, Discard a card. ({2}{W}{W}, Discard a card, Exile this card from your graveyard: " +
  "Create a token that's a copy of it, except it's a 4/4 black Zombie Human Wizard with no mana cost. " +
  "Eternalize only as a sorcery.)";

export default defineCard({
  name: "Sunscourge Champion",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${ENTERS}\n${ETERNALIZE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { powerOf: "source" } },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      ...eternalizeAbility("{2}{W}{W}", ETERNALIZE_TEXT),
      cost: { mana: "{2}{W}{W}", tap: false, discard: { count: 1 } },
    },
  ],
});
