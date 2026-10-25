import { defineCard } from "../define.js";

const FACE_UP_TEXT = "Whenever a permanent you control is turned face up, you gain 1 life for each creature you control.";
const MANIFEST_TEXT =
  "{3}{W}: Manifest the top card of your library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Mastery of the Unseen",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${FACE_UP_TEXT}\n${MANIFEST_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "you-control" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: MANIFEST_TEXT,
    },
  ],
});
