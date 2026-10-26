import { defineCard } from "../define.js";

// EDHREC rank 27634. "No Zombies on the battlefield" is anyone's: neither you nor any
// opponent controls one (an intervening-if, rule 603.4).

export default defineCard({
  name: "Sarcomancy",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "When this enchantment enters, create a 2/2 black Zombie creature token.\nAt the beginning of your upkeep, if there are no Zombies on the battlefield, this enchantment deals 1 damage to you.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: "When this enchantment enters, create a 2/2 black Zombie creature token.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "not", of: { kind: "controls", filter: { subtype: "Zombie" }, atLeast: 1 } },
          { kind: "not", of: { kind: "opponent-controls", filter: { subtype: "Zombie" }, atLeast: 1 } },
        ],
      },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "you" },
      resolve: null,
      text: "At the beginning of your upkeep, if there are no Zombies on the battlefield, this enchantment deals 1 damage to you.",
    },
  ],
});
