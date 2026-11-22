import { defineCard } from "../define.js";

// EDHREC rank 21009.
// Rulings: the attacker stays blocked with nothing put in (509.1h's "remains
// blocked", 506.4); the creature put in is blocking even if that block
// couldn't have been declared, and it never "blocked" for what triggers
// (509.4, 509.4b) — `enter-blocking`. It may be the Aetherplasm just returned.

const TEXT =
  "Whenever this creature blocks a creature, you may return this creature to its owner's hand. If you do, you may put a creature card from your hand onto the battlefield blocking that creature.";

export default defineCard({
  name: "Aetherplasm",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Aetherplasm to its owner's hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "return-to-hand", target: "source" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "returned-to-hand" },
              then: {
                kind: "sequence",
                effects: [
                  {
                    kind: "look-and-choose",
                    zone: "hand",
                    min: 0,
                    max: 1,
                    destination: "battlefield",
                    leftover: "stay",
                    filter: { type: "creature" },
                  },
                  { kind: "enter-blocking", blocker: "put-this-way", attacker: "trigger-object" },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
