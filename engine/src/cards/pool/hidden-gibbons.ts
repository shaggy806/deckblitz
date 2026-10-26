import { defineCard } from "../define.js";

// EDHREC rank 19257.
//
// Rulings:
//   [2004-10-04] It changes into a creature even if the spell is countered.
//   [2004-10-04] When it turns into a creature, it is no longer an enchantment.
//   [2008-08-01] The ability triggers when the spell is cast, so it becomes a creature before the
//     spell resolves.

const TEXT =
  "When an opponent casts an instant spell, if this permanent is an enchantment, it becomes a 4/4 Ape creature.";

export default defineCard({
  name: "Hidden Gibbons",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "instant" } },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Ape"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
