import { defineCard } from "../define.js";

// EDHREC rank 21907. Morningtide.
//
// Rulings:
//   [2008-04-01] If you're casting a spell "without paying its mana cost," you can't use its evoke
//     ability.
//   [2008-04-01] Whether evoke's sacrifice ability triggers when the creature enters depends on
//     whether the spell's controller chose to pay the evoke cost, not whether they actually paid
//     it.
//   [2008-04-01] Effects that cause you to pay more or less to cast a spell will cause you to pay
//     that much more or less while casting it for its evoke cost, too.

export default defineCard({
  name: "Walker of the Grove",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  evoke: { cost: "{4}{G}" },
  text: "When this creature leaves the battlefield, create a 4/4 green Elemental creature token.\nEvoke {4}{G} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "4/4 Green Elemental Token", count: 1 },
      resolve: null,
      text: "When this creature leaves the battlefield, create a 4/4 green Elemental creature token.",
    },
  ],
});
