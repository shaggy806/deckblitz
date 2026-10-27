import { defineCard } from "../define.js";

// EDHREC rank 26051.
//
// Rulings:
//   [2004-12-01] Once the token has been created, its power and toughness aren't dependent on
//     Gemini Engine's power and toughness, and they won't change if Gemini Engine's power and
//     toughness change.
//   [2004-12-01] The token's power and toughness are set equal to Gemini Engine's power and
//     toughness. If there's a Glorious Anthem on the battlefield (which gives your creatures
//     +1/+1), Gemini Engine is 4/5. The Twin token starts as a 4/5, and then the Anthem gives it
//     +1/+1, making the Twin a 5/6 creature.
//   [2004-12-01] The Twin token won't trigger any abilities that trigger "when [a creature]
//     attacks."
//   [2004-12-01] The Twin token enters as an untapped attacking creature. It's not subject to any
//     costs to attack or restrictions on attacking.
//
// The token's base P/T is fixed as it's made from this creature's current
// P/T (`basePt`, read through last-known information if it has left); a
// delayed ability about the token just made sacrifices it at end of combat
// (Kavaron Harrier's shape).

const TEXT =
  "Whenever this creature attacks, create a colorless Construct artifact creature token named Twin that's attacking. Its power is equal to this creature's power and its toughness is equal to this creature's toughness. Sacrifice the token at end of combat.";

export default defineCard({
  name: "Gemini Engine",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token",
            token: "Twin Token",
            count: 1,
            attacking: "choose",
            basePt: { power: { powerOf: "source" }, toughness: { toughnessOf: "source" } },
          },
          {
            kind: "delayed-trigger",
            at: "end-of-combat",
            about: "created",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice the token at end of combat.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
