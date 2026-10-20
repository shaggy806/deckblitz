import { defineCard } from "../define.js";

// Makes Boo (tokens/boo.ts).
//
// Rulings:
//   [2021-07-23] The activated ability will overwrite any previous effects that set the creature's
//     power and toughness to specific values. Effects that otherwise modify the target creature's
//     power and toughness will still apply no matter when they took effect. The same is true for
//     +1/+1 counters.

const BOO_TEXT = "When Minsc enters, create Boo, a legendary 1/1 red Hamster creature token with trample and haste.";
const GIANT_TEXT =
  "{X}: Until end of turn, target creature you control has base power and toughness X/X and becomes a Giant in addition to its other types. Activate only as a sorcery.";

export default defineCard({
  name: "Minsc, Beloved Ranger",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 3,
  toughness: 3,
  text: `${BOO_TEXT}\n${GIANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Boo", count: 1 },
      resolve: null,
      text: BOO_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "animate",
        target: 0,
        power: "x",
        toughness: "x",
        addTypes: [],
        addSubtypes: ["Giant"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: GIANT_TEXT,
      sorcerySpeed: true,
    },
  ],
});
