import { defineCard } from "../define.js";

const ENTER_TEXT = "When this Aura enters, draw two cards.";
const ATTACK_TEXT = "Whenever this creature attacks, if you have ten or more cards in hand, it gets +10/+10 until end of turn.";
const HAS_TEXT = `Enchanted creature has "You have no maximum hand size" and "${ATTACK_TEXT}"`;

export default defineCard({
  name: "Nerd Rage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${HAS_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsStatic: [{ affects: { scope: "self" }, noMaxHandSize: true, text: "You have no maximum hand size." }],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          condition: { kind: "hand-size", atLeast: 10 },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 10, toughness: 10, duration: "end-of-turn" },
          resolve: null,
          text: ATTACK_TEXT,
        },
      ],
      text: HAS_TEXT,
    },
  ],
});
