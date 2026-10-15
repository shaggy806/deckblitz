import { defineCard } from "../define.js";

// EDHREC rank 18771.
//
// Sutina, Speaker of the Tajuru's shape: the optional tap is a
// `choose-permanents` of up to one other untapped Merfolk, and "when you do"
// a reflexive trigger whose target is chosen as it goes on the stack, only
// once a Merfolk was actually tapped (the ruling). Mana value 3 or less reads
// a card's {X} as 0 in the graveyard (the ruling — rule 202.3e).

const ATTACK_TEXT =
  "Whenever this creature attacks, you may tap another untapped Merfolk you control. When you do, return target creature card with mana value 3 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Meanders Guide",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 3,
  toughness: 2,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { subtype: "Merfolk", controlledBy: "you", tapped: false },
            min: 0,
            upTo: 1,
            exceptSource: true,
            then: { kind: "tap", target: 0 },
            prompt: "You may tap another untapped Merfolk you control",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "tapped" },
            then: {
              kind: "reflexive-trigger",
              targets: [
                {
                  kind: "card-in-graveyard",
                  whose: "you",
                  filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
                },
              ],
              effect: { kind: "put-onto-battlefield", target: 0 },
              text: "When you do, return target creature card with mana value 3 or less from your graveyard to the battlefield.",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
