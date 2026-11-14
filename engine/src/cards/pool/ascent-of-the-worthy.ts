import { defineCard } from "../define.js";

// EDHREC rank 17955.
//
// - Chapters I and II: the creature is chosen as the chapter resolves (the
//   ruling), then a redirection until your next turn (rule 614.9) — still
//   combat damage where it was, none while that creature is off the
//   battlefield, and still to it if another player gains control of it (the
//   rulings). Both chapters' redirections can stand at once; the affected
//   creature's controller orders them (rule 616.1).
// - Chapter III: the card enters with its flying counter, an Angel Warrior
//   as it enters.

const REDIRECT_TEXT =
  "I, II — Choose a creature you control. Until your next turn, all damage that would be dealt to creatures you control is dealt to that creature instead.";
const RETURN_TEXT =
  "III — Return target creature card from your graveyard to the battlefield with a flying counter on it. That creature is an Angel Warrior in addition to its other types.";

export default defineCard({
  name: "Ascent of the Worthy",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${REDIRECT_TEXT}\n${RETURN_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        prompt: "Choose a creature you control: until your next turn, damage to your creatures is dealt to it instead",
        then: {
          kind: "damage-rule",
          to: { permanents: { type: "creature", controlledBy: "you" } },
          redirectTo: 0,
          duration: "until-your-next-turn",
        },
      },
      resolve: null,
      text: REDIRECT_TEXT,
    },
    {
      at: [3],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "put-onto-battlefield",
        target: 0,
        withCounters: { kind: "flying", amount: 1 },
        enterAs: { addSubtypes: ["Angel", "Warrior"] },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
