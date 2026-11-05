import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// "Do this only once each turn" counts a token made, so nothing is offered with
// no nonlegendary enchantment to copy: a "yes" with nothing to choose would use it
// up without making one. The enchantment is chosen as this resolves, no target.

const CONSTELLATION = "Constellation — Whenever Calix or another enchantment you control enters, put a +1/+1 counter on target creature.";
const COPY =
  "Whenever Calix or an enchanted creature you control deals combat damage to a player, you may create a token that's a copy of a nonlegendary enchantment you control. Do this only once each turn.";
const COPYABLE = { type: "enchantment", notSupertype: "legendary", controlledBy: "you" } as const;

export default defineCard({
  name: "Calix, Guided by Fate",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: `${CONSTELLATION}\n${COPY}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CONSTELLATION,
    }),
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { anyOf: [{ isSource: true }, { type: "creature", enchanted: true }] },
      },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: COPYABLE, atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Create a token that's a copy of a nonlegendary enchantment you control?",
          oncePerTurn: true,
          effect: {
            kind: "choose-permanents",
            filter: COPYABLE,
            min: 1,
            upTo: 1,
            prompt: "Choose a nonlegendary enchantment you control to copy",
            then: { kind: "create-token-copy", of: 0, count: 1 },
          },
        },
      },
      resolve: null,
      text: COPY,
    },
  ],
});
