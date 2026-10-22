import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 31157. Any Aura, whoever controls it, attached
// to a creature you control.

const TEXT = "{T}: Destroy target Aura attached to a creature you control.";

export default defineCard({
  name: "Miracle Worker",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        { kind: "permanent", filter: { subtype: "Aura", attachedTo: { type: "creature", controlledBy: "you" } } },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
