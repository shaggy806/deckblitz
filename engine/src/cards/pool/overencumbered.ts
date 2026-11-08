import { defineCard } from "../define.js";

// An Aura on a player. "That player" is the enchanted one, whose turn it is; the
// payment counts their artifacts as the trigger resolves. Not paying stops every
// attack this combat.

const ENTER = "When this Aura enters, enchanted opponent creates a Clue token, a Food token, and a Junk token.";
const TEXT =
  "At the beginning of combat on enchanted opponent's turn, that player may pay {1} for each artifact they control. If they don't, creatures can't attack this combat.";

export default defineCard({
  name: "Overencumbered",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant opponent\n${ENTER}\n${TEXT}`,
  targets: ["opponent"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "as-player",
        who: { controllerOf: "attached" },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Clue Token", count: 1 },
            { kind: "create-token", token: "Food Token", count: 1 },
            { kind: "create-token", token: "Junk Token", count: 1 },
          ],
        },
      },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "attached" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ payGeneric: { countOf: { type: "artifact", controlledBy: "active-player" } }, text: "Pay {X}" }],
        otherwise: { kind: "restrict", filter: { type: "creature" }, restrictions: ["cant-attack"], duration: "until-end-of-combat" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
