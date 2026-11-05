import { defineCard } from "../define.js";

// Chapter III targets the opponent, not the creature (the ruling: a creature
// with protection from white can be exiled): one of that player's creatures
// with the greatest power among theirs, chosen as it resolves — a tie is the
// controller's choice.

const I_TEXT = "I, II — Put a +1/+1 counter on up to one target creature.";
const III_TEXT = "III — Exile a creature with the greatest power among creatures target opponent controls.";

export default defineCard({
  name: "Fall of the Impostor",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [3],
      targets: ["opponent"],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
        controlledByPlayer: { target: 0 },
        min: 1,
        upTo: 1,
        prompt: "Exile a creature with the greatest power among creatures that player controls",
        then: { kind: "exile", target: 0 },
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
