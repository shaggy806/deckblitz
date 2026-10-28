import { defineCard } from "../define.js";

// EDHREC rank 29860.
//
// Hidden Herd's animation, on any land an opponent plays (`plays-land`, the
// special action — never a land an effect puts onto the battlefield); and back
// for good: "it becomes an enchantment" replaces its card types (`add-types`'
// `setTypes`, rule 205.1a), so its creature types go with them. Each is a
// later timestamp than the one before, so the latest wins.
//
// Rulings:
//   Does not trigger on lands put onto the battlefield by a spell or ability.
//   When it turns into a creature, it is no longer an enchantment.

const STAG_TEXT =
  "Whenever an opponent plays a land, if this permanent is an enchantment, it becomes a 3/2 Elk Beast creature.";
const HIDE_TEXT = "Whenever you play a land, if this permanent is a creature, it becomes an enchantment.";

export default defineCard({
  name: "Hidden Stag",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${STAG_TEXT}\n${HIDE_TEXT}`,
  triggered: [
    {
      trigger: { on: "plays-land", who: "opponent" },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 2,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Elk", "Beast"],
        duration: "permanent",
      },
      resolve: null,
      text: STAG_TEXT,
    },
    {
      trigger: { on: "plays-land", who: "you" },
      condition: { kind: "source", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-types", target: "source", setTypes: ["enchantment"], duration: "permanent" },
      resolve: null,
      text: HIDE_TEXT,
    },
  ],
});
