import { defineCard } from "../define.js";

// EDHREC rank 11644. Ixalan. "You may return target …" is an optional
// target slot (Sun Titan's shape): leaving it empty is declining.

export default defineCard({
  name: "Bishop of Rebirth",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever this creature attacks, you may return target creature card with mana value 3 or less from your graveyard to the battlefield.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: "Whenever this creature attacks, you may return target creature card with mana value 3 or less from your graveyard to the battlefield.",
    },
  ],
});
