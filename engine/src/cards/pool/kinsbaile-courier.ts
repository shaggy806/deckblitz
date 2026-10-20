import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on target creature.";
const ENCORE_TEXT =
  "Encore {2}{W} ({2}{W}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)";

export default defineCard({
  name: "Kinsbaile Courier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 1,
  text: `${ENTER_TEXT}\n${ENCORE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: ENCORE_TEXT,
    },
  ],
});
