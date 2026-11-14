import { defineCard } from "../define.js";

// "If excess damage was dealt to a creature this way": the target must be a
// creature for its excess to count — excess damage to a planeswalker or a
// battle (rule 120.4a) draws nothing, and a player takes no excess.
const ACTIVATED_TEXT =
  "{4}{R}, {Q}, Discard a card: Vikya, Scorching Stalwart deals damage equal to its power to any target. If excess damage was dealt to a creature this way, draw a card.";

export default defineCard({
  name: "Vikya, Scorching Stalwart",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 4,
  text: `Training (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)\n${ACTIVATED_TEXT} ({Q} is the untap symbol.)`,
  activated: [
    {
      cost: { mana: "{4}{R}", tap: false, untap: true, discard: { count: 1 } },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "target", index: 0, filter: { type: "creature" } },
                { kind: "excess-damage-this-way", to: 0 },
              ],
            },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self", withGreaterPower: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1, training: true },
      resolve: null,
      text: "Training",
    },
  ],
});
