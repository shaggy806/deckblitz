import { defineCard } from "../define.js";

const LOOK = "+1: Look at the top two cards of your library. Put one of them into your hand and the other on the bottom of your library.";
const UNTAP = "−1: Untap up to four target permanents.";
const EMBLEM = "You may activate loyalty abilities of planeswalkers you control on any player's turn any time you could cast an instant.";
const ULT = `−10: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Teferi, Temporal Archmage",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Teferi"],
  loyalty: 5,
  canBeCommander: true,
  text: `${LOOK}\n${UNTAP}\n${ULT}\nTeferi, Temporal Archmage can be your commander.`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: LOOK,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "permanent", max: 4 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "untap", target: 0 },
        simultaneous: true,
      },
      resolve: null,
      text: UNTAP,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        static: { affects: { scope: "self" }, loyaltyAtInstantSpeed: true, text: EMBLEM },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
