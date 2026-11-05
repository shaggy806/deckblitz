import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

const ENTER_TEXT =
  "When this Siege enters, reveal any number of Dragon cards from your hand. When you do, this Siege deals X plus 2 damage to any other target, where X is the number of cards revealed this way. (X can be 0.)";
const REFLEXIVE_TEXT =
  "When you do, this Siege deals X plus 2 damage to any other target, where X is the number of cards revealed this way.";

/** The reveal happens as the trigger resolves; the reflexive ability then
 * triggers whatever was revealed, none included (its rulings: 2 damage with
 * no Dragon), and targets as it goes on the stack, knowing X. */
export default defineCard({
  name: "Invasion of Tarkir",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 5,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: { cardsInHand: "you" },
            filter: { subtype: "Dragon" },
            destination: "reveal",
            leftover: "stay",
          },
          {
            kind: "reflexive-trigger",
            targets: [{ kind: "other", of: "any-target" }],
            value: { thisWay: "revealed", who: "you" },
            effect: { kind: "damage", target: 0, amount: { sum: [{ triggerValue: true }, 2] } },
            text: REFLEXIVE_TEXT,
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Tarkir", "Defiant Thundermaw"],
  transform: true,
});
