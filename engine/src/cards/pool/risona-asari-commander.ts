import { defineCard } from "../define.js";

// Rulings:
//   Removing the indestructible counter from Risona may cause it to die if it has taken lethal
//   damage, usually because it blocked in the same combat that you took damage.

const HIT_TEXT =
  "Whenever Risona deals combat damage to a player, if it doesn't have an indestructible counter on it, put an indestructible counter on it.";
const HURT_TEXT = "Whenever combat damage is dealt to you, remove an indestructible counter from Risona.";

export default defineCard({
  name: "Risona, Asari Commander",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${HIT_TEXT}\n${HURT_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      // An intervening "if" (rule 603.4): asked as it triggers and again as
      // it resolves.
      condition: { kind: "self-counters", counter: "indestructible", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "indestructible", amount: 1 },
      resolve: null,
      text: HIT_TEXT,
    },
    {
      // Once per combat damage event in which you're dealt combat damage,
      // however many creatures dealt it (only creatures deal combat damage —
      // rule 510.1).
      trigger: { on: "deals-damage-batch", who: "any", to: "you", combat: true },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "indestructible", amount: 1 },
      resolve: null,
      text: HURT_TEXT,
    },
  ],
});
