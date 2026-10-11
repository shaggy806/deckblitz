import { defineCard } from "../define.js";

// EDHREC rank 6766.
//
// Rulings:
//   You declare which player, planeswalker, or battle the token is attacking as you put it onto
//     the battlefield. It doesn't have to be attacking the same one Shaun is attacking.
//   Shaun's last ability will exile all Synth tokens you control, not just Synth tokens created by
//     its first ability.
//   Although the token is attacking, it was never declared as an attacking creature.
//   (and the usual copy rulings: copiable values only, a token's original characteristics, X is 0)
//
// "Whenever you attack" is `attack-with` (Shaun needn't attack). Satya's
// tapped-and-attacking copy (`attacking: "choose"` asks each token's defender,
// rule 508.4), with Ratadrabik's "not legendary" and Urza, Prince of Kroog's
// added types as copy exceptions (rule 707.9b). "You may" is asked as it
// resolves; the target is chosen as it's put on the stack.
const ATTACK_TEXT =
  "Whenever you attack, you may create a tapped and attacking token that's a copy of target attacking " +
  "legendary creature you control other than Shaun, except it's not legendary and it's a Synth artifact " +
  "creature in addition to its other types.";
const LEAVE_TEXT = "When Shaun leaves the battlefield, exile all Synth tokens you control.";

export default defineCard({
  name: "Shaun, Father of Synths",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 3,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [
        {
          kind: "other",
          of: {
            kind: "permanent",
            whose: "you",
            filter: { type: "creature", supertype: "legendary", attacking: true },
          },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Create a tapped and attacking Synth token copy of that legendary creature?",
        effect: {
          kind: "create-token-copy",
          of: 0,
          count: 1,
          who: "you",
          tapped: true,
          attacking: "choose",
          notLegendary: true,
          exceptions: { addTypes: ["artifact", "creature"], addSubtypes: ["Synth"] },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { token: true, subtype: "Synth", controlledBy: "you" } },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
