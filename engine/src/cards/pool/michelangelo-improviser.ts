import { defineCard } from "../define.js";

// One choice, so the two cards enter together: a slot each, and a card that is
// both (Dryad Arbor) fills either.
const TRIGGER =
  "Whenever Michelangelo deals combat damage to a player, you may put a creature card and/or a land card from your " +
  "hand onto the battlefield.";

export default defineCard({
  name: "Michelangelo, Improviser",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 4,
  toughness: 4,
  sneak: { cost: "{2}{G}{G}" },
  text:
    "Sneak {2}{G}{G} (You may cast this spell for {2}{G}{G} if you also return an unblocked attacker you control to " +
    `hand during the declare blockers step. He enters tapped and attacking.)\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 2,
        together: {
          oneEach: [
            { label: "a creature card", filter: { type: "creature" } },
            { label: "a land card", filter: { type: "land" } },
          ],
          text: "a creature card and/or a land card",
        },
        destination: "battlefield",
        leftover: "stay",
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
