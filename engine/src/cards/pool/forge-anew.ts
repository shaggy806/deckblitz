import { defineCard } from "../define.js";

const RETURN_TEXT = "When this enchantment enters, return target Equipment card from your graveyard to the battlefield.";
const TIMING_TEXT = "During your turn, you may activate equip abilities any time you could cast an instant.";
const FREE_TEXT =
  "You may pay {0} rather than pay the equip cost of the first equip ability you activate during each of your turns.";

export default defineCard({
  name: "Forge Anew",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${RETURN_TEXT}\n${TIMING_TEXT}\n${FREE_TEXT}`,
  static: [
    { affects: { scope: "self" }, condition: { kind: "your-turn" }, equipAtInstantSpeed: true, text: TIMING_TEXT },
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      alternativeAbilityCost: { kind: "equip", mana: "{0}", firstEachTurn: true },
      text: FREE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Equipment" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
