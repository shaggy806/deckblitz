import { defineCard } from "../define.js";

// EDHREC rank 19390.
//
// - The return works only from the graveyard (rule 113.6k — `fromGraveyard`),
//   and the cycle count is an intervening if (rule 603.4), read from the
//   journal's `cycled` entries: the cards its controller cycled this turn,
//   wherever this card was then. "Each end step" is every player's.
// - "A cycling ability" is any (`hasKeyword: "cycling"`, typecycling too).
const ENTER_TEXT =
  "When this creature enters, you may return target instant or sorcery card with a cycling ability from your graveyard to your hand.";
const RETURN_TEXT =
  "At the beginning of each end step, if you cycled two or more cards this turn, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Spellpyre Phoenix",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 4,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"], hasKeyword: "cycling" },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return target instant or sorcery card with a cycling ability from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "cycled", atLeast: 2 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
