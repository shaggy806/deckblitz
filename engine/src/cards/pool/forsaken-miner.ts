import { defineCard } from "../define.js";

const CANT_BLOCK_TEXT = "This creature can't block.";
const RETURN_TEXT =
  "Whenever you commit a crime, you may pay {B}. If you do, return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Forsaken Miner",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${CANT_BLOCK_TEXT}\n${RETURN_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: CANT_BLOCK_TEXT,
    },
  ],
  triggered: [
    {
      // Works only from the graveyard (rule 113.6k), where it must be as the
      // crime is committed — sacrificed to pay that spell's cost counts (the
      // ruling). {B} is paid as it resolves (the ruling).
      fromGraveyard: true,
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to return Forsaken Miner to the battlefield?",
        cost: "{B}",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
