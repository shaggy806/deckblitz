import { defineCard } from "../define.js";
import { soulshift } from "../helpers.js";

// Champions of Kamigawa (CHK). EDHREC rank 17821. Sire of the Storm's Spirit
// or Arcane cast trigger, with a drain on a target opponent.

const TEXT = "Whenever you cast a Spirit or Arcane spell, target opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Thief of Hope",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: `${TEXT}\nSoulshift 2 (When this creature dies, you may return target Spirit card with mana value 2 or less from your graveyard to your hand.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", target: 0, amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
    soulshift(2),
  ],
});
