import { defineCard } from "../define.js";

// EDHREC rank 28277.
//
// The target is chosen by an opponent — named by its controller as the
// ability goes on the stack, asked only among two or more — from the
// controller's own graveyard, and the ability stays the controller's (rule
// 603.3d).

const TEXT = "When this creature enters, return target creature card of an opponent's choice from your graveyard to your hand.";

export default defineCard({
  name: "Mausoleum Turnkey",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Rogue"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targetsChosenBy: "an-opponent",
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
