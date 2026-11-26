import { defineCard } from "../define.js";

// EDHREC rank 31949.
//
// "When it regenerates this way" is a triggered ability the regeneration
// sets off (a reflexive one, rule 603.12): the shield's `ifRegenerates` is a reflexive
// trigger, on the stack once a player would next receive priority, so the
// -1/-1 counter comes after the regeneration, not as part of it.

const TEXT = "{1}: Regenerate this creature. When it regenerates this way, put a -1/-1 counter on it.";

export default defineCard({
  name: "Matopi Golem",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "regenerate",
        target: "source",
        ifRegenerates: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 },
          text: "When it regenerates this way, put a -1/-1 counter on it.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
