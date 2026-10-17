import { defineCard } from "../define.js";

const UNTAP_MODE = "Untap target permanent.";
const DESTROY_MODE = "Destroy target non-Aura enchantment.";
const FLYING_MODE = "Target creature loses flying until end of turn.";

export default defineCard({
  name: "Emerald Charm",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${UNTAP_MODE}\n• ${DESTROY_MODE}\n• ${FLYING_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: UNTAP_MODE, targets: ["permanent"], effect: { kind: "untap", target: 0 } },
      {
        text: DESTROY_MODE,
        targets: [{ kind: "permanent", filter: { type: "enchantment", notSubtypes: ["Aura"] } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: FLYING_MODE,
        targets: ["creature"],
        effect: { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
      },
    ],
  },
});
