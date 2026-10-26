import { defineCard } from "../define.js";

// EDHREC rank 31564.

const TEXT =
  "When a creature is put into an opponent's graveyard from the battlefield, if this permanent is an enchantment, it becomes a 3/2 Phyrexian Imp creature with flying.";

export default defineCard({
  name: "Lurking Skirge",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", ownedBy: "opponent" } },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 2,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Phyrexian", "Imp"],
        keywords: ["flying"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
