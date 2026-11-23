import { defineCard } from "../define.js";

// "If The Covert Blue Mage is your commander, your starting deck can contain
// any number of cards beyond the maximum deck size" is a deckbuilding rule for
// the deck it commands, as Whtz, the Bibliophile's Rulebreaker is (read by
// deck-validation.ts): the hundred (rule 903.5a) is a minimum.

const ENTERS_TEXT =
  "When The Covert Blue Mage enters, create a colorless Equipment artifact token named Covert Sunglasses. It has \"Equipped creature can't be blocked\" and equip {2}{W/U}.";

export default defineCard({
  name: "The Covert Blue Mage",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  rulebreaker: { noMaximumSize: true },
  text: `If The Covert Blue Mage is your commander, your starting deck can contain any number of cards beyond the maximum deck size. (For example, your deck can be 120 cards.)\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Covert Sunglasses", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
