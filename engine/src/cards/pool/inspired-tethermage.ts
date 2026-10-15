import { defineCard } from "../define.js";

// EDHREC rank 26097.
// Makes Jace → "Jace Token".
//
// Rulings:
//   [2026-08-21] If you control a Jace planeswalker token, you can't choose to create a new one
//     when you empower Jace. You have to put the loyalty counters on your existing Jace
//     planeswalker token. In the rare case that you control multiple Jace planeswalker tokens,
//     you'll choose one of those tokens to put the loyalty counters on.
//   [2026-08-21] To empower Jace N, if you don't control a Jace planeswalker token, create a blue
//     Jace planeswalker token with 0 loyalty, "[−1]: Surveil 1," and "[−3]: Draw a card." Choose a
//     Jace planeswalker token you control. Put N loyalty counters on it.
//
// "Whenever you put one or more loyalty counters on a planeswalker" is a
// `counters-put` trigger narrowed to loyalty and `byYou`: once per
// planeswalker per placement — empower Jace, a planeswalker entering with
// its loyalty (rule 122.6), and a loyalty ability's plus cost (rule 606.4),
// whoever controls the planeswalker.
const LOYALTY_TEXT =
  "Whenever you put one or more loyalty counters on a planeswalker, put a +1/+1 counter on this creature.";
const EMPOWER_TEXT =
  "{6}: Empower Jace 2. (Put two loyalty counters on a Jace token you control. If you don't control one, first " +
  "create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";

export default defineCard({
  name: "Inspired Tethermage",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${LOYALTY_TEXT}\n${EMPOWER_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "counters-put",
        who: "any",
        counter: "loyalty",
        filter: { type: "planeswalker" },
        byYou: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LOYALTY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: { kind: "empower-jace", amount: 2 },
      resolve: null,
      text: "{6}: Empower Jace 2.",
    },
  ],
});
