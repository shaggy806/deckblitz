import { defineCard } from "../define.js";

// EDHREC rank 7500.
//
// "Your first, second, or third turns": turns you've taken (`turns-taken`);
// on another player's turn, with flash from somewhere, he's castable (Serra
// Avenger's ruling). The end step's "if" is an intervening one (rule 603.4),
// asked as the step begins and again on resolution: a spell cast this turn
// from anywhere but the hand (a copy isn't cast), or a land played from
// anywhere but the hand (rule 305.1; one put onto the battlefield by an effect
// isn't played, 305.4). His power is read as the ability resolves, as he last
// was if he's gone (608.2h).
const FUTURE = "From the Future — You can't cast Spider-Man 2099 during your first, second, or third turns of the game.";
const END_STEP =
  "At the beginning of your end step, if you've played a land or cast a spell this turn from anywhere other than your hand, Spider-Man 2099 deals damage equal to his power to any target.";

export default defineCard({
  name: "Spider-Man 2099",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 2,
  toughness: 3,
  keywords: ["double-strike", "vigilance"],
  text: `${FUTURE}\nDouble strike, vigilance\n${END_STEP}`,
  castOnlyIf: { kind: "not", of: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turns-taken", atMost: 3 }] } },
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "any",
        of: [
          { kind: "turn-history", what: "lands-played", who: "you", notFrom: ["hand"] },
          { kind: "cast-this-turn", who: "you", filter: { castFrom: { not: "hand" } } },
        ],
      },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: END_STEP,
    },
  ],
});
