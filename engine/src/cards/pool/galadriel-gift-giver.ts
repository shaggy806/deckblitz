import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 9601.
// Makes Treasure → use "Treasure Token".
// Makes Food → use "Food Token".
//
// Rulings:
//   [2024-11-08] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2024-11-08] You can't sacrifice a Food to pay multiple costs. For example, you can't
//     sacrifice a Food token to activate its own ability and also to activate Maraleaf Rider's
//     ability.
//   [2024-11-08] Whatever you do, don't eat the delicious cards.
//
// A modal triggered ability announces its mode as it goes on the stack (rule
// 700.2b), the counter mode bringing its target (Appa, Loyal Sky Bison's
// shape); one ability with two trigger events, written as two entries.

const TRIGGER_TEXT = "Whenever Galadriel enters or attacks, choose one —";
const COUNTER_MODE = "Put a +1/+1 counter on another target creature.";
const FOOD_MODE = "Create a Food token.";
const TREASURE_MODE = "Create a Treasure token.";

const MODES: EffectSpec = {
  kind: "modal",
  announced: true,
  minModes: 1,
  maxModes: 1,
  modes: [
    {
      text: COUNTER_MODE,
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
    },
    { text: FOOD_MODE, effect: { kind: "create-token", token: "Food Token", count: 1 } },
    { text: TREASURE_MODE, effect: { kind: "create-token", token: "Treasure Token", count: 1 } },
  ],
};

const TEXT = `${TRIGGER_TEXT} ${COUNTER_MODE} ${FOOD_MODE} ${TREASURE_MODE}`;

export default defineCard({
  name: "Galadriel, Gift-Giver",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 4,
  toughness: 4,
  text:
    `${TRIGGER_TEXT}\n• ${COUNTER_MODE}\n` +
    `• ${FOOD_MODE} (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")\n` +
    `• ${TREASURE_MODE} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: MODES, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, sameAbilityAs: 0, targets: [], effect: MODES, resolve: null, text: TEXT },
  ],
});
