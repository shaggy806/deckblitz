import { defineCard } from "../define.js";

// Rulings:
//   If all of the spell's targets are illegal when the spell tries to resolve, it won't resolve and
//     none of its effects will happen.
//   A card with a splice ability can't be spliced onto itself because the spell is on the stack
//     (and not in your hand) when you reveal the cards you want to splice onto it.
//   You choose all targets for the spell after revealing cards you want to splice, including any
//     targets required by the text of any of those cards. You may choose a different target for
//     each instance of the word "target" on the resulting spell.
//   You reveal all cards you intend to splice at the same time. Each individual card can be spliced
//     only once onto any one spell.

// Each time this turn, not only the next (rule 614.1a): a resolved damage
// replacement on the targeted permanent in the stint it has now (rule 400.7).
export default defineCard({
  name: "Overblaze",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{2}{R}{R}" },
  text: "Each time target permanent would deal damage to a permanent or player this turn, it deals double that damage to that permanent or player instead.\nSplice onto Arcane {2}{R}{R} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["permanent"],
  effect: {
    kind: "replacement-effect",
    replacement: { event: "would-deal-damage", instead: { modify: { times: 2 } } },
    duration: "end-of-turn",
    fromObject: 0,
  },
});
