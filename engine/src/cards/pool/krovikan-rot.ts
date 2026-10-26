import { defineCard } from "../define.js";
import { recover } from "../helpers.js";

export default defineCard({
  name: "Krovikan Rot",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature with power 2 or less.\nRecover {1}{B}{B} (When a creature is put into your graveyard from the battlefield, you may pay {1}{B}{B}. If you do, return this card from your graveyard to your hand. Otherwise, exile this card.)",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
  effect: { kind: "destroy", target: 0 },
  triggered: [recover("{1}{B}{B}")],
});
