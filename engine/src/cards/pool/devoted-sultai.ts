import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Devotion to Sultai is devotion to blue,
// black and green together (rule 700.5): each such symbol once, a hybrid one
// once. Read as the target is chosen and again as it resolves (Grim
// Servant's compare).

const TEXT =
  "When this creature enters, you may return target card from your graveyard with mana value X or less to your hand where X is your devotion to Sultai.";

export default defineCard({
  name: "Devoted Sultai",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Druid"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (Each {U}, {B}, or {G} in the mana cost of permanents you control counts towards your devotion those colors.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { manaValue: { op: "lte", n: { amount: { devotionTo: ["U", "B", "G"] } } } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the targeted card from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
