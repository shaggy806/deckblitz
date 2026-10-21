import { defineCard } from "../define.js";

const TEXT = "Whenever this token deals damage to a planeswalker, destroy that planeswalker.";

// Vraska, Swarm's Eminence's Assassin: a 1/1 black Assassin with deathtouch
// and a planeswalker-killing trigger (any damage, not only combat damage) —
// not Queen Marchesa's deathtouch-and-haste "Assassin Token".
export default defineCard({
  name: "Assassin Token (Vraska, Swarm's Eminence)",
  art: "b7e997ac-5a4a-4555-9b37-06c25a5db356",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Assassin"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "planeswalker" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient" },
      resolve: null,
      text: TEXT,
    },
  ],
});
