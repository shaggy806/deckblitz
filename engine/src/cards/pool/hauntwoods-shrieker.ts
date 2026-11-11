import { defineCard } from "../define.js";

// EDHREC rank 5974.
//
// The activated ability reveals the permanent to everyone, whoever controls
// it (`look-at-face-down`'s `reveal`), and then asks only if the card itself
// is a creature card (the `target` condition's `cardTypes`): the printed
// card, not what the face-down 2/2 is on the battlefield. Turned up by an
// effect, nothing is paid (the `turn-face-up` effect).
//
// Rulings:
//   [2024-09-20] Hauntwoods Shrieker's last ability considers only the characteristics of the
//     printed card. Static abilities that affect the characteristics of permanents on the
//     battlefield aren't taken into account. For example, if the revealed card is a noncreature
//     artifact card and March of the Machines is on the battlefield, it won't be turned face up.
//   [2024-09-20] Because the permanent is on the battlefield both before and after it's turned
//     face up, turning a permanent face up doesn't cause any enters-the-battlefield abilities to
//     trigger.
const DREAD =
  "Whenever this creature attacks, manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)";
const REVEAL_TEXT = "{1}{G}: Reveal target face-down permanent. If it's a creature card, you may turn it face up.";

export default defineCard({
  name: "Hauntwoods Shrieker",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast", "Mutant"],
  power: 3,
  toughness: 3,
  text: `${DREAD}\n${REVEAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "manifest-dread" },
      resolve: null,
      text: DREAD,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { faceDown: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-at-face-down", target: 0, reveal: true },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { faceDown: true }, cardTypes: ["creature"] },
            then: { kind: "may", prompt: "Turn the revealed creature card face up?", effect: { kind: "turn-face-up", target: 0 } },
          },
        ],
      },
      resolve: null,
      text: REVEAL_TEXT,
    },
  ],
});
