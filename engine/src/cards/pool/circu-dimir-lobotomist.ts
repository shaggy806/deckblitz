import { defineCard } from "../define.js";

const BLUE_TEXT = "Whenever you cast a blue spell, exile the top card of target player's library.";
const BLACK_TEXT = "Whenever you cast a black spell, exile the top card of target player's library.";
const LOCK_TEXT = "Your opponents can't cast spells with the same name as a card exiled with Circu.";

export default defineCard({
  name: "Circu, Dimir Lobotomist",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${BLUE_TEXT}\n${BLACK_TEXT}\n${LOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      resolve: null,
      text: BLUE_TEXT,
      targets: ["player"],
      effect: { kind: "exile-from-library", whose: 0, amount: 1, linked: true },
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B"] } },
      resolve: null,
      text: BLACK_TEXT,
      targets: ["player"],
      effect: { kind: "exile-from-library", whose: 0, amount: 1, linked: true },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "opponents", spells: { sameNameWith: "exiled-with-source" } },
      text: LOCK_TEXT,
    },
  ],
});
