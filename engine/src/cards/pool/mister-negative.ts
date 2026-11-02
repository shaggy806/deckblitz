import { defineCard } from "../define.js";

// Rulings:
//   If a player can't gain life, that player can't exchange life totals with a player with a
//   higher life total. Similarly, a player who can't lose life can't exchange life totals with a
//   player with a lower life total.

const TEXT =
  "Darkforce Inversion — When Mister Negative enters, you may exchange life totals with target opponent. If you lost life this way, draw that many cards.";

export default defineCard({
  name: "Mister Negative",
  manaCost: "{5}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance", "lifelink"],
  text: `Vigilance, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "may",
        prompt: "Exchange life totals with that opponent?",
        effect: { kind: "exchange-life-totals", second: { target: 0 } },
        then: { kind: "draw", amount: { lifeLostThisWay: true, who: "you" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
