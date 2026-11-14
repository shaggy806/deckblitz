import { defineCard } from "../define.js";

// EDHREC rank 7904.
//
// "You may convert Ratchet. When you do, …": the reflexive ability triggers
// only if it converted (rule 603.12) — the `this-way` `"transformed"` record,
// which rule 701.28e leaves empty when Ratchet has converted since this
// ability went on the stack. So of several life-gain triggers at once, only
// the first converts it and returns a card (the ruling); the rest do nothing.
// The reflexive target's mana value is read against the life gained this
// turn as the target is chosen and again as it resolves (rule 608.2b).
//
// Rulings:
//   [2022-10-14] Multiple instances of gaining life that happen at the same time will cause
//     Ratchet, Field Medic's last ability to trigger that many times. However, it can convert only
//     once when that happens. Once it has converted due to that triggered ability, the rest of the
//     abilities will resolve and do nothing.
//   [2022-10-14] Ratchet, Field Medic's last ability doesn't require a target. If you convert
//     Ratchet as it resolves, a second ability triggers and you choose a target for it. Players may
//     respond to this new triggered ability as normal.

const MTMTE = "More Than Meets the Eye {1}{W} (You may cast this card converted for {1}{W}.)";
const GAIN_TEXT =
  "Whenever you gain life, you may convert Ratchet. When you do, return target artifact card with mana value less than or equal to the amount of life you gained this turn from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Ratchet, Field Medic",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 4,
  keywords: ["lifelink"],
  text: `${MTMTE}\nLifelink\n${GAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Convert Ratchet?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "transform", target: "source" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "transformed" },
              then: {
                kind: "reflexive-trigger",
                targets: [
                  {
                    kind: "card-in-graveyard",
                    whose: "you",
                    filter: {
                      type: "artifact",
                      manaValue: { op: "lte", n: { amount: { turnStat: "life-gained", who: "you" } } },
                    },
                  },
                ],
                effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
                text: "When you do, return target artifact card with mana value less than or equal to the amount of life you gained this turn from your graveyard to the battlefield tapped.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
  faces: ["Ratchet, Field Medic", "Ratchet, Rescue Racer"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{1}{W}" },
});
