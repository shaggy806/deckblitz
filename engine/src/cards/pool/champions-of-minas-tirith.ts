import { defineCard } from "../define.js";

// The Lord of the Rings: Commander. "They can't attack you": the creatures that
// opponent controls, for this combat alone. X is read as the trigger resolves.

const MONARCH = "When this creature enters, you become the monarch.";
const TEXT =
  "At the beginning of combat on each opponent's turn, if you're the monarch, that opponent may pay {X}, where X is the number of cards in their hand. If they don't, they can't attack you this combat.";

export default defineCard({
  name: "Champions of Minas Tirith",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 6,
  text: `${MONARCH}\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "opponent" },
      condition: { kind: "monarch", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ payGeneric: { cardsInHand: "active-player" }, text: "Pay {X}" }],
        otherwise: { kind: "restrict", filter: { type: "creature", controlledBy: "you" }, sideOf: "active-player", restrictions: [{ kind: "cant-attack", at: "you" }], duration: "until-end-of-combat" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
