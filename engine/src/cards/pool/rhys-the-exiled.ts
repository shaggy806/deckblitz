import { defineCard } from "../define.js";

// EDHREC rank 8763.
//
// Rulings:
//   [2008-04-01] You may sacrifice Rhys the Exiled to pay for its own regeneration ability.
//     However, since Rhys is no longer on the battlefield, the ability will have no effect.

const ATTACK = "Whenever Rhys attacks, you gain 1 life for each Elf you control.";
const REGEN = "{B}, Sacrifice an Elf: Regenerate Rhys.";

export default defineCard({
  name: "Rhys the Exiled",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${ATTACK}\n${REGEN}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // "Each Elf you control" — any Elf permanent, not only creatures.
      effect: { kind: "gain-life", amount: { countOf: { subtype: "Elf", controlledBy: "you" } } },
      resolve: null,
      text: ATTACK,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: { filter: { subtype: "Elf" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN,
    },
  ],
});
