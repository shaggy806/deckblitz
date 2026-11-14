import { defineCard } from "../define.js";

// EDHREC rank 10194.

const FLICKER_TEXT =
  "{2}{W}{W}: Exile enchanted creature and all Auras attached to it. At the beginning of the next end step, return that card to the battlefield under its owner's control. If you do, return the other cards exiled this way to the battlefield under their owners' control attached to that creature.";

export default defineCard({
  name: "Flickerform",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${FLICKER_TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{2}{W}{W}", tap: false },
      targets: [],
      effect: {
        kind: "flicker",
        target: "attached",
        withAuras: true,
        returnAt: { step: "end" },
        returnText:
          "Return the exiled card to the battlefield under its owner's control, then the Auras exiled with it attached to it.",
      },
      resolve: null,
      text: FLICKER_TEXT,
    },
  ],
});
