import { defineCard } from "../define.js";

// EDHREC rank 13612. Constrictor Sage's enters trigger; a target already
// tapped just gets the stun counter (the ruling).

export default defineCard({
  name: "Gilded Scuttler",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Crab"],
  power: 1,
  toughness: 3,
  text: "This creature can't be blocked.\nWhen this creature enters, tap target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: "When this creature enters, tap target creature an opponent controls and put a stun counter on it.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
