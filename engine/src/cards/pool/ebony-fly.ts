import { defineCard } from "../define.js";

// EDHREC rank 8168. Whether it becomes a creature is chosen as the ability resolves, after the
// roll (its ruling) — a `may` after the roll, reading `{ roll: "total" }`.
export default defineCard({
  name: "Ebony Fly",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters tapped.\n{T}: Add {C}.\n{4}: Roll a d6. Until end of turn, you may have this artifact become an X/X Insect artifact creature with flying, where X is the result.\nWhenever this artifact attacks, another target attacking creature gains flying until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 6,
        then: {
          kind: "may",
          prompt: "Have Ebony Fly become an X/X Insect artifact creature with flying until end of turn?",
          effect: {
            kind: "animate",
            target: "source",
            power: { roll: "total" },
            toughness: { roll: "total" },
            addTypes: ["artifact", "creature"],
            addSubtypes: ["Insect"],
            keywords: ["flying"],
            duration: "end-of-turn",
          },
        },
      },
      resolve: null,
      text: "{4}: Roll a d6. Until end of turn, you may have this artifact become an X/X Insect artifact creature with flying, where X is the result.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this artifact attacks, another target attacking creature gains flying until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
