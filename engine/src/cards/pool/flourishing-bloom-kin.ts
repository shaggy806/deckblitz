import { defineCard } from "../define.js";

// EDHREC rank 11838.
//
// A 0/0 that gets +1/+1 for each Forest you control (face down it has no
// abilities and is a 2/2). Disguise {4}{G}. The face-up search is
// Cultivate's split: the first Forest card chosen goes onto the battlefield
// tapped and the other into your hand — with only one found, it goes onto
// the battlefield (the ruling). "Forest cards", not basic ones.
const PUMP = "This creature gets +1/+1 for each Forest you control.";
const FACE_UP =
  "When this creature is turned face up, search your library for up to two Forest cards and reveal them. Put one of them onto the battlefield tapped and the other into your hand, then shuffle.";

export default defineCard({
  name: "Flourishing Bloom-Kin",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Elemental"],
  power: 0,
  toughness: 0,
  text: `${PUMP}\nDisguise {4}{G}\n${FACE_UP}`,
  morph: { keyword: "disguise", cost: "{4}{G}" },
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Forest", controlledBy: "you" }, pt: [1, 1] },
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", subtype: "Forest" },
        min: 0,
        max: 2,
        destination: "battlefield",
        enterTapped: true,
        restDestination: "hand",
        reveal: true,
      },
      resolve: null,
      text: FACE_UP,
    },
  ],
});
