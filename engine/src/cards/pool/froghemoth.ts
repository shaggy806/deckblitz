import { defineCard } from "../define.js";

const HIT_TEXT =
  "Whenever this creature deals combat damage to a player, exile up to that many target cards from their graveyard. Put a +1/+1 counter on this creature for each creature card exiled this way. You gain 1 life for each noncreature card exiled this way.";

// "That many" is the combat damage dealt (the trigger value), bounding the
// group as the trigger goes on the stack; the counters and life count the
// cards actually exiled, by type.
export default defineCard({
  name: "Froghemoth",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Horror"],
  power: 4,
  toughness: 4,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${HIT_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "trigger-player" },
          max: { triggerValue: true },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0 } },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { thisWay: "exiled", filter: { type: "creature" } },
          },
          { kind: "gain-life", amount: { thisWay: "exiled", filter: { notTypes: ["creature"] } } },
        ],
      },
      resolve: null,
      text: HIT_TEXT,
    },
  ],
});
