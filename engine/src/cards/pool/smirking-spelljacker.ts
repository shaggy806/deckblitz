import { defineCard } from "../define.js";

// Rulings:
//   Spells that can't be countered can still be exiled by Smirking Spelljacker's triggered ability.
//   You choose whether to cast the exiled card as Smirking Spelljacker's last ability resolves. You
//     can't wait to cast it later in the turn. Timing restrictions based on the card's types are
//     ignored.
//   If you cast a card exiled with Smirking Spelljacker, it will go to the stack. Even if it returns
//     to exile, it will no longer be exiled with Smirking Spelljacker, so you can't cast it again.

const EXILE_TEXT = "When this creature enters, exile target spell an opponent controls.";
const ATTACK_TEXT = "Whenever this creature attacks, if a card is exiled with it, you may cast the exiled card without paying its mana cost.";

export default defineCard({
  name: "Smirking Spelljacker",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn", "Wizard", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${EXILE_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: EXILE_TEXT,
      targets: [{ kind: "spell", whose: "opponent", filter: {} }],
      effect: { kind: "exile", target: 0, linked: true },
    },
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "exiled-with-source", atLeast: 1, now: true },
      resolve: null,
      text: ATTACK_TEXT,
      targets: [],
      effect: { kind: "cast-now", from: "exiled-with-source", free: true },
    },
  ],
});
