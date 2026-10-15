import { defineCard } from "../define.js";

// EDHREC rank 17180.
//
// "You may blight 2" is an optional additional cost (Burning Curiosity's
// kicker), and "if this spell's additional cost was paid, choose both
// instead" is HULK SMASH!'s `kickedModes`: both modes, each needing its
// target, chosen as it's cast (rule 601.2b).
const TEXT =
  "As an additional cost to cast this spell, you may blight 2. (You may put two -1/-1 counters on a creature you control.)\n" +
  "Choose one. If this spell's additional cost was paid, choose both instead.\n" +
  "• Destroy target artifact or enchantment.\n" +
  "• Destroy target creature with mana value 3 or greater.";

export default defineCard({
  name: "Pyrrhic Strike",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "", keyword: "blight", blight: 2 },
  text: TEXT,
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Destroy target artifact or enchantment.",
        targets: ["artifact-or-enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Destroy target creature with mana value 3 or greater.",
        targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "gte", n: 3 } } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
