import { defineCard } from "../define.js";

const TEXT =
  "{T}: Prevent the next 3 damage that would be dealt to target creature this turn. Activate only if you have more cards in hand than each opponent.";

export default defineCard({
  name: "Kitsune Bonesetter",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Cleric"],
  power: 0,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "player-compare", stat: "hand", compare: "more", than: "each-opponent" },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
