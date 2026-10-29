import { defineCard } from "../define.js";

// EDHREC rank 7717.
//
// Rulings:
//   Once the first ability resolves, the damage prevention continues to apply even if that
//   permanent changes controllers.
//   Kiora's first ability can target any permanent an opponent controls, not just one that can
//   deal or be dealt damage.
//
// - The +1 is Dovin, Hand of Control's −1: two damage rules over the target,
//   until Kiora's controller's next turn.
// - The emblem's 9/9 blue Kraken is the token Spawning Kraken makes.
const PLUS_TEXT =
  "+1: Until your next turn, prevent all damage that would be dealt to and dealt by target permanent an opponent controls.";
const MINUS_TEXT = "−1: Draw a card. You may play an additional land this turn.";
const EMBLEM_TEXT = "At the beginning of your end step, create a 9/9 blue Kraken creature token.";
const ULT_TEXT = `−5: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Kiora, the Crashing Wave",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kiora"],
  loyalty: 2,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", whose: "opponent", filter: {} }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", to: { target: 0 }, duration: "until-your-next-turn" },
          { kind: "damage-rule", by: { target: 0 }, duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "additional-land-drop", amount: 1 },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        triggered: [
          {
            trigger: { on: "step-begins", step: "end", who: "you" },
            targets: [],
            effect: { kind: "create-token", token: "Kraken Token (Spawning Kraken)", count: 1 },
            resolve: null,
            text: EMBLEM_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
