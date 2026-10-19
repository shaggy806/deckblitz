import { defineCard } from "../define.js";

// EDHREC rank 8940. Streets of New Capenna. "A spell you control that wasn't
// cast" is a spell on the stack with no cast record — a copy (rule 707.10),
// which `{ cast: false }` reads on the stack.
const TEXT = "{1}{U}, {T}: Copy target spell you control that wasn't cast. You may choose new targets for the copy.";

export default defineCard({
  name: "Errant, Street Artist",
  manaCost: "{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 0,
  toughness: 3,
  keywords: ["flash", "defender", "haste"],
  text: `Flash\nDefender, haste\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [{ kind: "spell", whose: "you", filter: { cast: false } }],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
