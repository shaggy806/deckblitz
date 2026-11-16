import { defineCard } from "../define.js";

// Doctor Who (WHO). EDHREC rank 10883.
//
// Meet in Reverse is the `drawsFromBottom` static: every draw its controller makes takes the
// bottom card. Spoilers is one ability on three events, written as two triggered abilities as
// "enters or attacks" is (Mishra, Lost to Phyrexia): a scry or a surveil (`scries` with
// `orSurveil`), and a search of their own library — no event is both, so each triggers exactly
// when the printed one does. The damage is dealt by River Song at its power as that part
// resolves, after the counter.
//
// Rulings:
//   Drawing cards from the bottom of your library is exactly the same as drawing from the top,
//     except that you take the bottom card of your library and put it into your hand.
//   River Song's first ability applies to all cards you draw while it is on the battlefield, not
//     just the card you draw for your turn.

const REVERSE = "Meet in Reverse — You draw cards from the bottom of your library rather than the top.";
const SPOILERS =
  "Spoilers — Whenever an opponent scries, surveils, or searches their library, put a +1/+1 counter on River Song. Then River Song deals damage to that player equal to its power.";

const SPOIL = {
  kind: "sequence",
  effects: [
    { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
    { kind: "damage", amount: { powerOf: "source" }, who: "trigger-player" },
  ],
} as const;

export default defineCard({
  name: "River Song",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Time Lord", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${REVERSE}\n${SPOILERS}`,
  static: [{ affects: { scope: "self" }, drawsFromBottom: "you", text: REVERSE }],
  triggered: [
    {
      trigger: { on: "scries", who: "opponent", orSurveil: true },
      targets: [],
      effect: SPOIL,
      resolve: null,
      text: SPOILERS,
    },
    {
      trigger: { on: "event", event: "searches-library", who: "opponent" },
      targets: [],
      effect: SPOIL,
      resolve: null,
      text: SPOILERS,
    },
  ],
});
