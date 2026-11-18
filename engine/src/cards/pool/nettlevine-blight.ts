import { defineCard } from "../define.js";

// "Nettlevine Blight" in the granted trigger is the Aura that grants it (rule
// 201.5a): `attachment: "granter"`. "You" is the enchanted permanent's
// controller, who controls the granted ability (rule 113.8): they sacrifice
// it and choose a creature or land they control for the Aura (rule 701.3a),
// one it can enchant. With none, or with the Aura gone before the ability
// resolves (rule 400.7), it attaches to nothing, and an Aura attached to
// nothing goes to the graveyard (rule 704.5m).

const GRANTED =
  "At the beginning of your end step, sacrifice this permanent and attach Nettlevine Blight to a creature or land you control.";
const TEXT = `Enchanted permanent has "${GRANTED}"`;

export default defineCard({
  name: "Nettlevine Blight",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature or land\n${TEXT}`,
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "end", who: "you" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "sacrifice-source" },
              {
                kind: "attach",
                attachment: "granter",
                target: {
                  among: { typesAnyOf: ["creature", "land"], controlledBy: "you" },
                  prompt: "Attach Nettlevine Blight to a creature or land you control",
                },
              },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
