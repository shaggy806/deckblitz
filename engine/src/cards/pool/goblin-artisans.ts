import { defineCard } from "../define.js";

// EDHREC rank 25238. Antiquities.
//
// The target is chosen as the ability is activated, so it needs an artifact spell of yours on the
// stack (rule 602.2b) whatever the flip comes to. "That isn't the target of an ability from another
// creature named Goblin Artisans" is `not: { targetedByAbility: … }`, asked as each target is chosen
// and again as the ability resolves (608.2b): a second Artisans' ability aimed at the same spell
// makes the first one's target illegal.

const TEXT =
  "{T}: Flip a coin. If you win the flip, draw a card. If you lose the flip, counter target artifact spell you control that isn't the target of an ability from another creature named Goblin Artisans.";

export default defineCard({
  name: "Goblin Artisans",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "spell",
          whose: "you",
          filter: {
            type: "artifact",
            not: {
              targetedByAbility: { source: { name: "Goblin Artisans", type: "creature" }, otherThanSource: true },
            },
          },
        },
      ],
      effect: { kind: "flip-coin", won: { kind: "draw", amount: 1 }, lost: { kind: "counter", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
