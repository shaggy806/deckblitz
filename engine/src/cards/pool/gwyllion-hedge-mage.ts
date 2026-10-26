import { defineCard } from "../define.js";

// EDHREC rank 29337.
//
// Rulings:
//   [2008-08-01] Each of the triggered abilities has an "intervening 'if' clause." That means (1)
//     the ability won't trigger at all unless you control two or more lands of the appropriate
//     land type when the Hedge-Mage enters, and (2) the ability will do nothing if you don't
//     control two or more lands of the appropriate land type by the time it resolves.
//   [2008-08-01] Each of the triggered abilities look at your lands individually. This means that
//     if you only control two dual-lands of the appropriate types, both of the abilities will
//     trigger.
//   [2008-08-01] Both abilities are optional; you choose whether to use them when they resolve. If
//     an ability has a target, you must choose a target even if you don't plan to use the ability.
//   [2008-08-01] Both abilities trigger at the same time. You can put them on the stack in any
//     order.

export default defineCard({
  name: "Gwyllion Hedge-Mage",
  manaCost: "{2}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Hag", "Wizard"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, if you control two or more Plains, you may create a 1/1 white Kithkin Soldier creature token.\nWhen this creature enters, if you control two or more Swamps, you may put a -1/-1 counter on target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 2 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 white Kithkin Soldier creature token?",
        effect: { kind: "create-token", token: "Kithkin Soldier Token", count: 1 },
      },
      resolve: null,
      text: "When this creature enters, if you control two or more Plains, you may create a 1/1 white Kithkin Soldier creature token.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 2 },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put a -1/-1 counter on target creature?",
        effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      },
      resolve: null,
      text: "When this creature enters, if you control two or more Swamps, you may put a -1/-1 counter on target creature.",
    },
  ],
});
