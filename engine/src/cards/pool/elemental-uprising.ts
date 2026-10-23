import { defineCard } from "../define.js";

// EDHREC rank 25073.
export default defineCard({
  name: "Elemental Uprising",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target land you control becomes a 4/4 Elemental creature with haste until end of turn. It's still a land. It must be blocked this turn if able.",
  targets: ["land-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        keywords: ["haste"],
        duration: "end-of-turn",
      },
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
    ],
  },
});
