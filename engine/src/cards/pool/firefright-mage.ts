import { defineCard } from "../define.js";

// "Except by artifact creatures and/or red creatures": no blocker that is
// neither an artifact nor red — a rule on the creature for this turn.
export default defineCard({
  name: "Firefright Mage",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: "{1}{R}, {T}, Discard a card: Target creature can't be blocked this turn except by artifact creatures and/or red creatures.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: {
        kind: "restrict",
        target: 0,
        restrictions: [],
        cantBeBlockedBy: { notTypes: ["artifact"], notColors: ["R"] },
      },
      resolve: null,
      text: "{1}{R}, {T}, Discard a card: Target creature can't be blocked this turn except by artifact creatures and/or red creatures.",
    },
  ],
});
