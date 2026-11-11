import { defineCard } from "../define.js";

// Back face of Reidane, God of the Worthy (a modal double-faced card).
//
// Rulings:
//   Valkmira's first ability prevents 1 damage from each source an opponent
//   controls each time that source would deal damage to you. It prevents 1
//   of any kind of damage, not just combat damage.
//   Valkmira's last ability affects each spell (including Aura spells),
//   activated ability, and triggered ability controlled by an opponent that
//   targets you or another permanent you control.
//
// Guardian Seraph's prevention widened to your side; Unsettled Mariner's
// trigger, less Valkmira itself ("another").

const PREVENT_TEXT =
  "If a source an opponent controls would deal damage to you or a permanent you control, prevent 1 of that damage.";
const COUNTER_TEXT =
  "Whenever you or another permanent you control becomes the target of a spell or ability an opponent controls, counter that spell or ability unless its controller pays {1}.";

export default defineCard({
  name: "Valkmira, Protector's Shield",
  art: "https://cards.scryfall.io/art_crop/back/3/6/3606519e-5677-4c21-a34e-be195b6669fa.jpg",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${PREVENT_TEXT}\n${COUNTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "your-side",
        source: { controlledBy: "opponent" },
        instead: { prevent: 1 },
      },
      text: PREVENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", player: "you", byOpponentOnly: true, otherOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{1}" } },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
  faces: ["Reidane, God of the Worthy", "Valkmira, Protector's Shield"],
});
