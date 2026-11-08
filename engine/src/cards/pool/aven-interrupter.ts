import { defineCard } from "../define.js";

// Rulings:
//   [2024-04-12] You can't cast a plotted card on the same turn it became plotted. On any future
//     turn, you may cast that card from exile without paying its mana cost during your main phase
//     while the stack is empty.
//   [2024-04-12] Spells that can't be countered can still be exiled by Aven Interrupter's
//     triggered ability. They won't resolve.
//   [2024-04-12] If you're casting a plotted card from exile without paying its mana cost, you
//     can't choose to cast it for any other alternative costs. You can, however, pay additional
//     costs, such as kicker costs. If the plotted card has any mandatory additional costs, those
//     must still be paid to cast the spell.
//   [2024-04-12] If a plotted card has {X} in its mana cost, you must choose 0 as the value of X
//     when casting it without paying its mana cost.
//   [2024-04-12] If the plotted card's owner casts it, the spell has no relation to the spell
//     that player originally cast. Any choices made for the original spell or effects affecting
//     the original spell aren't carried over to the new one.
//   [2024-04-12] If an instant or a card with flash is plotted this way, you can still cast it
//     only when you have priority during your main phase while the stack is empty.

const EXILE =
  "When this creature enters, exile target spell. It becomes plotted. (Its owner may cast it as a sorcery on a later turn without paying its mana cost.)";
const TAX = "Spells your opponents cast from graveyards or from exile cost {2} more to cast.";

export default defineCard({
  name: "Aven Interrupter",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${EXILE}\n${TAX}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["spell"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "become-plotted", target: 0 },
        ],
      },
      resolve: null,
      text: EXILE,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, increaseGeneric: 2, when: { caster: "opponent", castFrom: ["graveyard", "exile"], castFromAnyones: true } },
      text: TAX,
    },
  ],
});
