import { defineCard } from "../define.js";

// EDHREC rank 14299.
//
// Rulings:
//   [2024-09-20] If Haunted Screen leaves the battlefield and then returns, it's a new object with
//     no memory of its previous existence. You may activate its last ability again.
//
// "Activate only once" is once for as long as the object exists: the
// `exhaust` bookkeeping (`GameObject.exhaustedAbilities`, cleared by a zone
// change, which is the ruling). It becomes a 0/0 Spirit artifact creature for
// good (no duration), so the seven counters make it a 7/7.
const ANIMATE_TEXT =
  "{7}: Put seven +1/+1 counters on this artifact. It becomes a 0/0 Spirit creature in addition to its other types. Activate only once.";

export default defineCard({
  name: "Haunted Screen",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {W} or {B}.\n{T}, Pay 1 life: Add {G}, {U}, or {R}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "B"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {W} or {B}.",
    },
    {
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "U", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}, Pay 1 life: Add {G}, {U}, or {R}.",
    },
    {
      cost: { mana: "{7}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 7 },
          {
            kind: "animate",
            target: "source",
            power: 0,
            toughness: 0,
            addTypes: ["creature"],
            addSubtypes: ["Spirit"],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: ANIMATE_TEXT,
      exhaust: true,
    },
  ],
});
