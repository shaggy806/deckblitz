import { defineCard } from "../define.js";

// EDHREC rank 2615. The delayed return runs only if this card is still the same
// card in the graveyard it went to (`sameObject`): exiled, or shuffled back and
// milled, it stays where it is.

const PUMP_TEXT = "Enchanted creature gets +1/+1, has deathtouch, and is goaded. (It attacks each combat if able and attacks a player other than you if able.)";
const DIES_TEXT = "When enchanted creature dies, return this card to the battlefield at the beginning of the next end step.";

export default defineCard({
  name: "Ghoulish Impetus",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\n${DIES_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], grantKeywords: ["deathtouch"], goads: true, text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end" },
        effect: {
          kind: "conditional",
          condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
          then: { kind: "put-onto-battlefield", target: "source" },
        },
        text: "Return Ghoulish Impetus to the battlefield.",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
