import { defineCard } from "../define.js";

const PING_TEXT =
  "{G}: This creature deals 1 damage to each creature with flying and each player. Any player may activate this ability.";

export default defineCard({
  name: "Ifh-Bíff Efreet",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PING_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      anyPlayer: true,
      text: PING_TEXT,
    },
  ],
});
