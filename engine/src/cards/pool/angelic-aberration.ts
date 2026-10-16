import { defineCard } from "../define.js";

// EDHREC rank 8293. Modern Horizons 3 Commander.
//
// Rulings:
//   [2024-08-02] A creature's base power and toughness are its printed ones (a token's, those it
//     was created with), or what an effect that sets them made them; a modifier (+1/+1, a
//     counter) isn't included, but a characteristic-defining ability is.
//
// Devoid: colorless for its white mana cost. "Sacrifice any number" is
// Scapeshift's `choose-permanents` (the chosen creatures sacrificed as one
// event) over the creatures you control with base power or base toughness 1
// or less, and "that many" counts what was actually sacrificed this way.
const ENTER_TEXT =
  "When this creature enters, sacrifice any number of creatures each with base power or toughness 1 or less. Create that many 4/4 colorless Eldrazi Angel creature tokens with flying and vigilance.";
const SMALL = {
  type: "creature",
  controlledBy: "you",
  anyOf: [{ basePower: { op: "lte", n: 1 } }, { baseToughness: { op: "lte", n: 1 } }],
} as const;

export default defineCard({
  name: "Angelic Aberration",
  manaCost: "{5}{W}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Devoid (This card has no color.)\nFlying, vigilance\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: SMALL,
            upTo: { countOf: SMALL },
            then: { kind: "sacrifice-target", target: 0 },
            prompt: "Sacrifice any number of creatures each with base power or toughness 1 or less",
          },
          { kind: "create-token", token: "Eldrazi Angel Token", count: { thisWay: "sacrificed" } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
