import { defineCard } from "../define.js";

// Rulings:
//   [2022-09-09] Rosnakht, Heir of Rohgahh's last ability goes on the stack above the spell that
//     caused it to trigger and resolves first. It resolves even if that spell is countered or
//     otherwise left the stack.

export default defineCard({
  name: "Rosnakht, Heir of Rohgahh",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kobold", "Warrior"],
  power: 0,
  toughness: 1,
  text: "Battle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)\nHeroic — Whenever you cast a spell that targets Rosnakht, create a 0/1 red Kobold creature token named Kobolds of Kher Keep.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Battle cry",
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "create-token", token: "Kobolds of Kher Keep", count: 1 },
      resolve: null,
      text: "Heroic — Whenever you cast a spell that targets Rosnakht, create a 0/1 red Kobold creature token named Kobolds of Kher Keep.",
    },
  ],
});
