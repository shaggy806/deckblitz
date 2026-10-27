import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 27486. Seedling Charm's shape: Devout Harpist's
// Aura kill, Daru Encampment's Soldier pump, Engineered Might's vigilance.

export default defineCard({
  name: "Piety Charm",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target Aura attached to a creature.\n• Target Soldier creature gets +2/+2 until end of turn.\n• Creatures you control gain vigilance until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target Aura attached to a creature.",
        targets: [{ kind: "permanent", filter: { subtype: "Aura", attachedTo: { type: "creature" } } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Target Soldier creature gets +2/+2 until end of turn.",
        targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Soldier" } }],
        effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      },
      {
        text: "Creatures you control gain vigilance until end of turn.",
        targets: [],
        effect: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "vigilance",
          duration: "end-of-turn",
        },
      },
    ],
  },
});
