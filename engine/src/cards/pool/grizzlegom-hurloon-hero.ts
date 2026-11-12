import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Rulebreaker is a deckbuilding rule only
// (`rulebreaker`, read by deck-validation.ts): "any land cards" lets in a land
// of any colour identity; singleton still holds for nonbasic ones. The attack
// trigger's steps happen in order, each counting its land type as it does.
const RULEBREAKER_TEXT = "Rulebreaker — A deck with this commander can have any land cards.";
const ATTACK_TEXT =
  "Whenever Grizzlegom attacks, create a 1/1 white Soldier creature token for each Plains you control. Draw a card for each Island you control. Each opponent loses 1 life for each Swamp you control. Put a +1/+1 counter on Grizzlegom for each Mountain you control. You gain 1 life for each Forest you control.";

export default defineCard({
  name: "Grizzlegom, Hurloon Hero",
  manaCost: "{5}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${RULEBREAKER_TEXT}\n${ATTACK_TEXT}`,
  rulebreaker: { anyIdentity: [{ types: ["land"] }] },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token",
            token: "Soldier Token",
            count: { countOf: { subtype: "Plains", controlledBy: "you" } },
          },
          { kind: "draw", amount: { countOf: { subtype: "Island", controlledBy: "you" } } },
          {
            kind: "lose-life",
            who: "each-opponent",
            amount: { countOf: { subtype: "Swamp", controlledBy: "you" } },
          },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { countOf: { subtype: "Mountain", controlledBy: "you" } },
          },
          { kind: "gain-life", amount: { countOf: { subtype: "Forest", controlledBy: "you" } } },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
