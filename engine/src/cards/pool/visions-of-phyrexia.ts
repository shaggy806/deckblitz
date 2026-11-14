import { defineCard } from "../define.js";

// "Play a card from exile" is casting a spell from exile or playing a land
// from exile (rules 601.2, 305.1), whatever let you — this card's own
// permission or any other (foretell, an adventure, another impulse). An
// intervening "if" (rule 603.4): asked as the end step begins and again on
// resolution.

const UPKEEP_TEXT = "At the beginning of your upkeep, exile the top card of your library. You may play that card this turn.";
const END_TEXT =
  "At the beginning of your end step, if you didn't play a card from exile this turn, create a tapped Powerstone token.";
const POWERSTONE_REMINDER =
  "(It's an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")";

export default defineCard({
  name: "Visions of Phyrexia",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${END_TEXT} ${POWERSTONE_REMINDER}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "not",
        of: {
          kind: "any",
          of: [
            { kind: "turn-history", what: "lands-played", who: "you", from: ["exile"] },
            { kind: "cast-this-turn", who: "you", filter: { castFrom: "exile" } },
          ],
        },
      },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
