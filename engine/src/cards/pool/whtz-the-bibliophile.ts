import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Rulebreaker is a deckbuilding rule only
// (`rulebreaker`, read by deck-validation.ts): a hundred cards is a minimum.
// "If you had 200 or more cards in your starting deck" reads the size dealt
// at setup (`PlayerState.startingDeckSize`).
const RULEBREAKER_TEXT = "Rulebreaker — A deck with this commander has no maximum deck size.";
const DRAW_TEXT =
  "{3}, {T}: You draw a card and gain 1 life. This ability costs {3} less to activate if you had 200 or more cards in your starting deck.";

export default defineCard({
  name: "Whtz, the Bibliophile",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 3,
  text: `${RULEBREAKER_TEXT}\n${DRAW_TEXT}`,
  rulebreaker: { noMaximumSize: true },
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      costReduction: { reduceGeneric: 3, condition: { kind: "starting-deck-size", atLeast: 200 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
