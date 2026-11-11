import { defineCard } from "../define.js";

// Commander Masters (CMM). EDHREC rank 8220.
//
// Each time it deals combat damage sets up one more delayed ability (rule
// 603.7), each copying the next loyalty ability once. The copy is put on the
// stack above the ability and resolves first; it changes no loyalty, and a
// [−X] ability's copy has the same X (the rulings).
const COPY =
  "Whenever this creature deals combat damage to a player or planeswalker, copy the next loyalty ability you activate this turn when you activate it. You may choose new targets for the copy.";
const RETURN = "Whenever you cast a planeswalker spell, you may return this card from your graveyard to the battlefield.";

// An attacker deals its combat damage to the one player or planeswalker it
// attacks, so the two triggers never both fire for one damage event.
const copyNext = {
  kind: "delayed-trigger",
  at: { whenever: { on: "activates-ability", who: "you", loyalty: true }, once: true },
  effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
  text: "Copy that ability. You may choose new targets for the copy.",
} as const;

export default defineCard({
  name: "Jaya's Phoenix",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${COPY}\n${RETURN}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player", combat: true },
      targets: [],
      effect: copyNext,
      resolve: null,
      text: COPY,
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "planeswalker", combat: true },
      targets: [],
      effect: copyNext,
      resolve: null,
      text: COPY,
    },
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { type: "planeswalker" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Jaya's Phoenix from your graveyard to the battlefield?",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
