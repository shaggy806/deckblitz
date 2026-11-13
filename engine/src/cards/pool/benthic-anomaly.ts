import { defineCard } from "../define.js";

// EDHREC rank 4251. Devoid is `colors: []` and the printed line. The creatures
// are chosen as the trigger resolves, one question per opponent (no targets:
// hexproof and shroud don't stop it), then which of them the token copies.
// The totals are those creatures' power and toughness as it resolves, set as
// the token's own — copiable values, like "a colorless Eldrazi creature"
// (instead of its other colors, card types and subtypes; a supertype stays).
// An opponent with no creature has none chosen; with none at all, no token.
//
// Rulings:
//   - If the copied creature has {X} in its mana cost, X is 0.
//   - If the copied creature is itself a token, the token created by Benthic Anomaly's ability
//     copies the original characteristics of that token as stated by the effect that created it,
//     with the listed exception.
//   - If the copied creature is copying something else, then the token enters the battlefield as
//     whatever that creature copied, with the listed exceptions.
//   - The token is an Eldrazi creature instead of its other types and subtypes and is colorless
//     instead of retaining any of its colors. It retains any supertypes it had, such as legendary
//     or snow. These are copiable values of the token that other effects may copy.
//   - Any enters-the-battlefield abilities of the copied creature will trigger when the token
//     enters the battlefield.
//   - Benthic Anomaly's triggered ability will resolve before Benthic Anomaly does. If Benthic
//     Anomaly is countered or otherwise leaves the stack in response to that triggered ability, the
//     triggered ability will still resolve as normal.

const DEVOID = "Devoid (This card has no color.)";
const CAST_TEXT =
  "When you cast this spell, for each opponent, choose a creature that player controls. Create a token that's a copy of one of those creatures, except its power is equal to the total power of those creatures, its toughness is equal to the total toughness of those creatures, and it's a colorless Eldrazi creature.";

export default defineCard({
  name: "Benthic Anomaly",
  manaCost: "{6}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Serpent"],
  power: 7,
  toughness: 8,
  text: `${DEVOID}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            who: "you",
            for: {
              permanent: { type: "creature" },
              about: "each-opponent",
              prompt: "Choose a creature this player controls",
            },
          },
          {
            kind: "choose-permanents",
            filter: { thisWay: "chosen" },
            min: 1,
            upTo: 1,
            prompt: "Choose which of those creatures the token copies",
            then: {
              kind: "create-token-copy",
              of: 0,
              count: 1,
              who: "you",
              exceptions: {
                power: { aggregate: "sum", of: "power", filter: {}, in: { thisWay: "chosen" } },
                toughness: { aggregate: "sum", of: "toughness", filter: {}, in: { thisWay: "chosen" } },
                setColors: [],
                setTypes: ["creature"],
                setSubtypes: ["Eldrazi"],
              },
            },
          },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
