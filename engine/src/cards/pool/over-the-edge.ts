import { defineCard } from "../define.js";

export default defineCard({
  name: "Over the Edge",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose one —\n• Destroy target artifact or enchantment.\n• Target creature you control explores, then it explores again. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on that creature, then put the card back or put it into your graveyard. Then repeat this process.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target artifact or enchantment.",
        targets: ["artifact-or-enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Target creature you control explores, then it explores again.",
        targets: ["creature-you-control"],
        effect: { kind: "explore", target: 0, times: 2 },
      },
    ],
  },
});
