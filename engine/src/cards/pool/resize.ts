import { defineCard } from "../define.js";
import { recover } from "../helpers.js";

export default defineCard({
  name: "Resize",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +3/+3 until end of turn.\nRecover {1}{G} (When a creature is put into your graveyard from the battlefield, you may pay {1}{G}. If you do, return this card from your graveyard to your hand. Otherwise, exile this card.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
  triggered: [recover("{1}{G}")],
});
