import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 12750.
//
// "Only you may activate this ability" is Martyrdom's own text, so "you" is
// Martyrdom's controller (`onlyBy: "granter"`, bound as it resolves — rule
// 602.1b): they alone may activate the granted ability, even if another
// player gains control of the creature, and that player may not. The damage
// is redirected (rule 614.9) only while this creature is still on the
// battlefield as a creature (the rulings); redirecting its own damage to
// itself does nothing useful (the rulings).
const GRANTED =
  "{0}: The next 1 damage that would be dealt to target creature, planeswalker, or player this turn is dealt to this creature instead.";
const TEXT = `Until end of turn, target creature you control gains "${GRANTED}" Only you may activate this ability.`;

export default defineCard({
  name: "Martyrdom",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature-you-control"],
  effect: {
    kind: "grant-activated",
    target: 0,
    ability: {
      cost: { mana: "{0}", tap: false },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] }, orPlayer: "any" }],
      effect: { kind: "prevent-damage", target: 0, amount: 1, redirectTo: "source" },
      onlyBy: "granter",
      resolve: null,
      text: `${GRANTED} Only you may activate this ability.`,
    },
    duration: "end-of-turn",
  },
});
