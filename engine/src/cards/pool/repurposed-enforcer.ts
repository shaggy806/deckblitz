import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 21503.
//
// Rulings:
//   [2026-08-21] To empower Jace N, if you don't control a Jace planeswalker token, create a blue
//     Jace planeswalker token with 0 loyalty, "[−1]: Surveil 1," and "[−3]: Draw a card." Choose a
//     Jace planeswalker token you control. Put N loyalty counters on it.
//   [2026-08-21] Empower Jace won't let you put loyalty counters on nontoken Jace planeswalkers.
//     However, if you control a Jace planeswalker token that you got another way (such as an
//     effect that creates a token that's a copy of a permanent), empower Jace will put loyalty
//     counters on that.
//   [2026-08-21] If you control a Jace planeswalker token, you can't choose to create a new one
//     when you empower Jace. You have to put the loyalty counters on your existing Jace
//     planeswalker token. In the rare case that you control multiple Jace planeswalker tokens,
//     you'll choose one of those tokens to put the loyalty counters on.
//
// X is counted as the ability resolves (rule 608.2h) — this creature too,
// while it's still there.

const TEXT = "Whenever this creature attacks, empower Jace X, where X is the number of creatures you control.";

export default defineCard({
  name: "Repurposed Enforcer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: `${TEXT} (Put that many loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with "[−1]: Surveil 1" and "[−3]: Draw a card.")`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: { countOf: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
