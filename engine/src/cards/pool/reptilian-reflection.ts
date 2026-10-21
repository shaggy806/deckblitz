import { defineCard } from "../define.js";

// EDHREC rank 27863.
//
// Rulings:
//   [2020-04-17] You can cycle a card even if it has a triggered ability from cycling that won’t
//     have a legal target. This is because the cycling ability and the triggered ability are
//     separate. This also means that if either ability is countered (with Disallow, for example),
//     the other ability will still resolve.
//   [2020-04-17] Triggered abilities from cycling a card and the cycling ability itself aren’t
//     spells. Effects that interact with spells (such as that of Cancel) won’t affect them.
//   [2020-04-17] Some cards with cycling have an ability that triggers when you cycle them, and
//     some cards have an ability that triggers whenever you cycle any card. These triggered
//     abilities resolve before you draw from the cycling ability.

export default defineCard({
  name: "Reptilian Reflection",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Whenever you cycle a card, you may have this enchantment become a 5/4 Dinosaur creature with trample and haste in addition to its other types until end of turn.",
  triggered: [
    {
      trigger: { on: "cycles", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have this enchantment become a 5/4 Dinosaur creature with trample and haste until end of turn?",
        effect: {
          kind: "animate",
          target: "source",
          power: 5,
          toughness: 4,
          addTypes: ["creature"],
          addSubtypes: ["Dinosaur"],
          keywords: ["trample", "haste"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: "Whenever you cycle a card, you may have this enchantment become a 5/4 Dinosaur creature with trample and haste in addition to its other types until end of turn.",
    },
  ],
});
