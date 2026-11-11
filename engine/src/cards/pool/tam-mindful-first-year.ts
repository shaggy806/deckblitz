import { defineCard } from "../define.js";

const HEXPROOF_TEXT = "Each other creature you control has hexproof from each of its colors.";
const COLORS_TEXT = "{T}: Target creature you control becomes all colors until end of turn.";

// `ownColors`: each creature's hexproof is from the colours it is now, so one
// made all colours has hexproof from each color, and a colourless one none.
export default defineCard({
  name: "Tam, Mindful First-Year",
  manaCost: "{1}{G/U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gorgon", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${HEXPROOF_TEXT}\n${COLORS_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" }, excludeSelf: true },
      hexproofFrom: { ownColors: true },
      text: HEXPROOF_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "become", target: 0, setColors: ["W", "U", "B", "R", "G"], duration: "end-of-turn" },
      resolve: null,
      text: COLORS_TEXT,
    },
  ],
});
