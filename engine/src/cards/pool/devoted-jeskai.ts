import { defineCard } from "../define.js";

// Playtest card. Devotion to Jeskai is devotion to blue, red and white (rule
// 700.5): a symbol of any of the three counts once, this creature's own {U}
// included. X is read as the target is chosen and again as it resolves.

const BOUNCE_TEXT =
  "When this creature enters, you may return target creature an opponent controls with mana value X or less to its owners hand, where X is your devotion to Jeskai.";

export default defineCard({
  name: "Devoted Jeskai",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Monk"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${BOUNCE_TEXT} (Each {U}, {R}, or {W} in the mana costs of permanents you control counts towards your devotion to Jeskai.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: {
            type: "creature",
            manaValue: { op: "lte", n: { amount: { devotionTo: ["U", "R", "W"] } } },
          },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return that creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
