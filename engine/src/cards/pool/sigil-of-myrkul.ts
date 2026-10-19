import { defineCard } from "../define.js";

const COMBAT_TEXT =
  "At the beginning of combat on your turn, mill a card. When you do, if there are four or more creature cards in your graveyard, put a +1/+1 counter on target creature you control and it gains deathtouch until end of turn.";
const WHEN_YOU_DO =
  "When you do, if there are four or more creature cards in your graveyard, put a +1/+1 counter on target creature you control and it gains deathtouch until end of turn.";
const FOUR_CREATURES = { kind: "cards-in-graveyard", atLeast: 4, filter: { type: "creature" } } as const;

// The trigger has no target; after the mill, a reflexive ability triggers if
// the graveyard holds four or more creature cards, and its target is chosen
// then (its ruling). The intervening-if is checked again as it resolves
// (rule 603.4).
export default defineCard({
  name: "Sigil of Myrkul",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${COMBAT_TEXT} (To mill a card, put the top card of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "all", of: [{ kind: "this-way", what: "milled" }, FOUR_CREATURES] },
            then: {
              kind: "reflexive-trigger",
              targets: ["creature-you-control"],
              effect: {
                kind: "conditional",
                condition: FOUR_CREATURES,
                then: {
                  kind: "sequence",
                  effects: [
                    { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
                    { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
                  ],
                },
              },
              text: WHEN_YOU_DO,
            },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
