import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 28647. Hidden Spider's shape.
//
// Rulings:
//   When it turns into a creature, it is no longer an enchantment.
//   Does not trigger on lands put onto the battlefield by a spell or ability.
//   A noncreature permanent that turns into a creature can attack, and its {T} abilities can be
//     activated, only if its controller has continuously controlled that permanent since the
//     beginning of their most recent turn.
//
// "Plays" a land is the special action (rule 305.1): `plays-card` with a land
// filter, never a land put onto the battlefield by an effect.

const TEXT =
  "When an opponent plays a nonbasic land, if this permanent is an enchantment, it becomes a 3/3 Beast creature.";

export default defineCard({
  name: "Hidden Herd",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "plays-card", who: "opponent", filter: { type: "land", notSupertype: "basic" } },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Beast"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
