import { defineCard } from "../define.js";

// "Has changeling" is an exception, so a copiable value: the copy is every
// creature type (rule 702.73a), and so is a copy of the copy.
export default defineCard({
  name: "Omni-Changeling",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  convoke: true,
  power: 0,
  toughness: 0,
  text: "Changeling (This card is every creature type.)\nConvoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nYou may have this creature enter as a copy of any creature on the battlefield, except it has changeling.",
  copyOnEnter: { filter: { type: "creature" }, except: { keywords: ["changeling"] } },
});
