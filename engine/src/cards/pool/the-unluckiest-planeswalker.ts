import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. The +1 is a loyalty ability, not a mana
// ability (rule 605.1a), with Pyromancer's Goggles' `whenSpent` rider. The −3
// moves each Aura attached to you, one at a time, onto the opponent you choose
// for it (`for-each-permanent` binds the Aura to slot 0, `choose-opponent`'s
// "that player" is the host); one that can't enchant them stays (701.3b).
// Rulebreaker is a deckbuilding rule only (`rulebreaker`).
const RULEBREAKER_TEXT =
  "Rulebreaker — A deck with this commander can have Aura cards of any color identity and any basic land cards.";
const PLUS =
  "+1: Add one mana of any color. When you spend this mana to cast an Aura spell this turn, create a 1/1 red Gremlin creature token.";
const MINUS =
  "−3: Discard your hand, then draw cards equal to twice the number of Auras you control. For each Aura attached to you, attach it to an opponent of your choice.";
const COMMANDER_TEXT = "The Unluckiest Planeswalker can be your commander.";

export default defineCard({
  name: "The Unluckiest Planeswalker",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: [],
  loyalty: 4,
  canBeCommander: true,
  text: `${RULEBREAKER_TEXT}\n${PLUS}\n${MINUS}\n${COMMANDER_TEXT}`,
  rulebreaker: {
    anyIdentity: [{ subtypes: ["Aura"] }, { supertypes: ["basic"], types: ["land"] }],
  },
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        whenSpent: {
          spell: { subtype: "Aura" },
          effect: { kind: "create-token", token: "Gremlin Token", count: 1 },
          text: "When you spend this mana to cast an Aura spell this turn, create a 1/1 red Gremlin creature token.",
        },
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: { countOf: { subtype: "Aura", controlledBy: "you" }, times: 2 } },
          {
            kind: "for-each-permanent",
            filter: { subtype: "Aura", attachedToPlayer: "you" },
            effect: {
              kind: "choose-opponent",
              then: { kind: "attach", attachment: 0, target: { player: "that-player" } },
            },
          },
        ],
      },
      resolve: null,
      text: MINUS,
    },
  ],
});
