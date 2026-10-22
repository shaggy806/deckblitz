import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Top-5000 #3943. An attacker deals its combat damage to the one player or
// planeswalker it attacks, so the two halves never fire for the same damage
// (Silent Submersible's shape). Discarding none is not doing it — nothing is
// drawn or added either way. The mana is the number discarded, not drawn
// (the ruling): both read `thisWay: "discarded"`.

const TRIGGER =
  "Whenever Neheb deals combat damage to a player or planeswalker, you may discard any number of cards. If you do, draw that many cards and add that much {R}. Until end of turn, you don't lose this mana as steps and phases end.";

const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "discard", target: "you", amount: 0, anyNumber: true },
    { kind: "draw", amount: { thisWay: "discarded" } },
    { kind: "add-mana", mana: "R", amount: { thisWay: "discarded" }, persists: true },
  ],
};

export default defineCard({
  name: "Neheb, Dreadhorde Champion",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Minotaur", "Warrior"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player", combat: true },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TRIGGER,
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "planeswalker", combat: true },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TRIGGER,
    },
  ],
});
