import { defineCard } from "../define.js";

// EDHREC rank 11830. Front face. More Than Meets the Eye (rule 702.162a);
// convert is transform. Dolmen Gate's prevention, for attacking Humans.

const PREVENT_TEXT = "Prevent all combat damage that would be dealt to attacking Humans you control.";
const CAST_TEXT = "Whenever you cast your second spell each turn, convert Goldbug.";

export default defineCard({
  name: "Goldbug, Humanity's Ally",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 3,
  text: `More Than Meets the Eye {W}{U} (You may cast this card converted for {W}{U}.)\n${PREVENT_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: true,
        instead: { prevent: true },
        toFilter: { type: "creature", subtype: "Human", attacking: true, controlledBy: "you" },
      },
      text: PREVENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  faces: ["Goldbug, Humanity's Ally", "Goldbug, Scrappy Scout"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{W}{U}" },
});
