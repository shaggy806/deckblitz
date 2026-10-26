import { defineCard } from "../define.js";

// Urza's Saga. EDHREC rank 28704.
//
// Rulings:
//   [2004-10-04] If the spell is no longer on the stack when the triggered ability resolves, the
//     mana value of the spell is still remembered.
//   [2004-10-04] It triggers when the spell is cast, which means it becomes a creature before that
//     spell resolves.
//   [2004-10-04] When it turns into a creature, it is no longer an enchantment.
//   [2004-10-04] It changes into a creature even if the spell is countered.
//
// The spell's mana value is read once, as the animate applies (rule
// 608.2h), from the trigger object as it last existed.

const TEXT =
  "When an opponent casts a spell, if this permanent is an enchantment, it becomes an Illusion creature with power and toughness each equal to that spell's mana value.";

export default defineCard({
  name: "Veiled Sentry",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: { manaValueOf: "trigger-object" },
        toughness: { manaValueOf: "trigger-object" },
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Illusion"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
