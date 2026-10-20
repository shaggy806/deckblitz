import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 14166. Ziatora, the Incinerator's shape: the
// attack trigger has no target; the sacrifice happens as it resolves, and
// "when you do" is a reflexive ability that targets then (the ruling). The
// damage is the sacrificed creature's power as it was sacrificed, doubled if
// it was a Giant — both read as the sacrifice is made and carried as the
// reflexive ability's value.
const TEXT =
  "Whenever this creature attacks, you may sacrifice another creature. When you do, this creature deals damage equal to the sacrificed creature's power to any target. If the sacrificed creature was a Giant, this creature deals twice that much damage instead.";

export default defineCard({
  name: "Surtland Flinger",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Berserker"],
  power: 4,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["any-target"],
          value: {
            ifCondition: { kind: "sacrificed", filter: { subtype: "Giant" } },
            then: { product: [{ powerOf: "sacrificed" }, 2] },
            else: { powerOf: "sacrificed" },
          },
          effect: { kind: "damage", target: 0, amount: { triggerValue: true } },
          text: "When you do, this creature deals damage equal to the sacrificed creature's power to any target. If the sacrificed creature was a Giant, this creature deals twice that much damage instead.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
