import { defineCard } from "../define.js";

const TEXT =
  "Whenever enchanted creature attacks, reveal cards from the top of your library until you reveal an Aura card. You may put that card onto the battlefield. If you don't, put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Songbirds' Blessing",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["creature"],
  text: `Enchant creature\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { subtype: "Aura" },
        rest: "bottom-random",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "may",
              prompt: "Put the revealed Aura onto the battlefield? (If you don't, it goes into your hand.)",
              effect: { kind: "put-onto-battlefield", target: 0 },
            },
            {
              kind: "conditional",
              condition: { kind: "not", of: { kind: "this-way", what: "put-onto-battlefield" } },
              then: { kind: "return-to-hand", target: 0, from: "library" },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
