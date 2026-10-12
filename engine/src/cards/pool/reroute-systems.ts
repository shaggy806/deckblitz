import { defineCard } from "../define.js";

export default defineCard({
  name: "Reroute Systems",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Target artifact or creature gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)\n• Reroute Systems deals 2 damage to target tapped creature.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target artifact or creature gains indestructible until end of turn.",
        targets: ["artifact-or-creature"],
        effect: {
          kind: "grant-keyword",
          target: 0,
          keyword: "indestructible",
          duration: "end-of-turn",
        },
      },
      {
        text: "Reroute Systems deals 2 damage to target tapped creature.",
        targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
        effect: { kind: "damage", amount: 2, target: 0 },
      },
    ],
  },
});
