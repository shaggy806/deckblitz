import { defineCard } from "../define.js";

// EDHREC rank 18792.
//
// Repartee is Graduation Day's cast trigger; "can't be blocked this turn" is
// Gateway Sneak's until-end-of-turn unblockable.
//
// Rulings:
//   [2026-03-20] It doesn't matter if the creature or creatures targeted by the spell that caused
//     the repartee ability to trigger leave the battlefield or stop being creatures before that
//     spell resolves. As long as that spell targeted one or more creatures when it was cast, the
//     repartee ability will trigger and later resolve.
//   [2026-03-20] A repartee ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack.

export default defineCard({
  name: "Snooping Page",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature can't be blocked this turn.\nWhenever this creature deals combat damage to a player, you draw a card and lose 1 life.",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature can't be blocked this turn.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you draw a card and lose 1 life.",
    },
  ],
});
