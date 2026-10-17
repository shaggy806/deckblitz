import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] Gumdrop Poisoner's enters-the-battlefield ability counts the total amount of life
//     you gained without taking into account any life you lost during that turn. For example, if
//     you lost 3 life and gained 3 life earlier in the turn, the target creature will get -3/-3.

const LIFE_GAINED = { turnStat: "life-gained", who: "you" } as const;
const TEXT =
  "When this creature enters, up to one target creature gets -X/-X until end of turn, where X is the amount of life you gained this turn.";

export default defineCard({
  name: "Gumdrop Poisoner",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [LIFE_GAINED, -1] },
        toughness: { product: [LIFE_GAINED, -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Gumdrop Poisoner", "Tempt with Treats"],
  adventure: true,
});
