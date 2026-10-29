import { defineCard } from "../define.js";

// Rulings:
//   [2022-12-02] Loyalty abilities are a type of activated ability, so Hold for Questioning will
//     prevent an enchanted planeswalker's loyalty abilities being activated.
//   [2022-12-02] You can enchant a permanent that is already tapped with Hold for Questioning. If
//     you do, it doesn't become tapped again, but you will still investigate.

export default defineCard({
  name: "Hold for Questioning",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature or planeswalker\nWhen this Aura enters, tap enchanted permanent and investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")\nEnchanted permanent doesn't untap during its controller's untap step and its activated abilities can't be activated.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          { kind: "create-token", token: "Clue Token", count: 1 },
        ],
      },
      resolve: null,
      text: "When this Aura enters, tap enchanted permanent and investigate.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted permanent doesn't untap during its controller's untap step and its activated abilities can't be activated.",
    },
  ],
});
