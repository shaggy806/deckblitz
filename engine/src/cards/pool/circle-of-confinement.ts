import { defineCard } from "../define.js";

// Rulings:
//   If Circle of Confinement leaves the battlefield before its enters-the-battlefield ability
//     resolves, the target creature won't be exiled.
//   If a token is exiled this way, it will cease to exist and won't return to the battlefield.

const EXILE_TEXT = "When this enchantment enters, exile target creature an opponent controls with mana value 3 or less until this enchantment leaves the battlefield.";
const VAMPIRE_TEXT = "Whenever an opponent casts a Vampire spell with the same name as a card exiled with this enchantment, you gain 2 life.";

export default defineCard({
  name: "Circle of Confinement",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${EXILE_TEXT}\n${VAMPIRE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: EXILE_TEXT,
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "opponent", manaValue: { op: "lte", n: 3 } } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
    },
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { subtype: "Vampire", sameNameWith: "exiled-with-source" } },
      resolve: null,
      text: VAMPIRE_TEXT,
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
    },
  ],
});
