import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// X is read as the ability resolves (ruling).
const TEXT =
  "Constellation — Whenever this enchantment or another enchantment you control enters, target creature gets +X/+X until end of turn, where X is the number of creature cards in your graveyard.";

const X = { countInGraveyard: { type: "creature", ownedBy: "you" } } as const;

export default defineCard({
  name: "Strength from the Fallen",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    }),
  ],
});
