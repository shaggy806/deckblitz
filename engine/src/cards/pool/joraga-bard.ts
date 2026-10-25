import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// Akoum Battlesinger's rally, granting vigilance to the Allies there as it
// resolves (its ruling).

const TEXT =
  "Whenever this creature or another Ally you control enters, you may have Ally creatures you control gain vigilance until end of turn.";

export default defineCard({
  name: "Joraga Bard",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Rogue", "Bard", "Ally"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Ally creatures you control gain vigilance until end of turn?",
        effect: {
          kind: "grant-keyword-all",
          filter: { type: "creature", subtype: "Ally", controlledBy: "you" },
          keyword: "vigilance",
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
