import { defineCard } from "../define.js";

// EDHREC rank 19945.
//
// Rulings:
//   Each creature with lifelink dealing combat damage is a single life-gaining event. For example, if two creatures an opponent controls with lifelink deal combat damage at the same time, Kavu Predator's ability will trigger twice. However, if a single creature an opponent controls with lifelink deals combat damage to multiple creatures, players, and/or planeswalkers at the same time (perhaps because it has trample or was blocked by more than one creature), the ability will trigger only once.
//   Kavu Predator's last ability triggers just once for each life-gaining event, whether it's 1 life from Kor Firewalker or 6 life from Renewed Faith.
//   If an opponent gains an amount of life "for each" of something (such as from Congregate), that life is gained as one event and Kavu Predator's ability triggers only once.

export default defineCard({
  name: "Kavu Predator",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nWhenever an opponent gains life, put that many +1/+1 counters on this creature.",
  triggered: [
    {
      trigger: { on: "gains-life", who: "opponent" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever an opponent gains life, put that many +1/+1 counters on this creature.",
    },
  ],
});
