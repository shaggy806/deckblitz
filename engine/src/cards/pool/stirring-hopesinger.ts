import { defineCard } from "../define.js";

// EDHREC rank 9933.
//
// Rulings:
//   [2026-03-20] It doesn't matter if the creature or creatures targeted by the spell that caused
//     the repartee ability to trigger leave the battlefield or stop being creatures before that
//     spell resolves. As long as that spell targeted one or more creatures when it was cast, the
//     repartee ability will trigger and later resolve.
//   [2026-03-20] A repartee ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack.

const REPARTEE_TEXT =
  "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on each creature you control.";

// The spell's targets are read as it's cast (the cast trigger's filter —
// `targets`), so a targeted creature leaving before the trigger resolves
// changes nothing (the ruling); only a creature on the battlefield is "a
// creature", not a creature card in a graveyard.
export default defineCard({
  name: "Stirring Hopesinger",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Bard"],
  power: 1,
  toughness: 3,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${REPARTEE_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: [],
      effect: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: REPARTEE_TEXT,
    },
  ],
});
