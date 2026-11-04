import { defineCard } from "../define.js";

// Rulings:
//   You could target a creature you control with Smoke Teller's ability, but there's no benefit to
//     doing so.
//   Smoke Teller's ability lets you look at the creature as the ability resolves. It doesn't let you
//     look at it later, although you should be given a reasonable amount of time to look at it. In a
//     multiplayer game, be sure not to reveal the card to other players.

const LOOK_TEXT = "{1}{U}: Look at target face-down creature.";

export default defineCard({
  name: "Smoke Teller",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: LOOK_TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      resolve: null,
      text: LOOK_TEXT,
      targets: [{ kind: "permanent", filter: { type: "creature", faceDown: true } }],
      effect: { kind: "look-at-face-down", target: 0 },
    },
  ],
});
