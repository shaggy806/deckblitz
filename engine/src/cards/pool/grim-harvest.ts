import { defineCard } from "../define.js";
import { recover } from "../helpers.js";

export default defineCard({
  name: "Grim Harvest",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Return target creature card from your graveyard to your hand.\nRecover {2}{B} (When a creature is put into your graveyard from the battlefield, you may pay {2}{B}. If you do, return this card from your graveyard to your hand. Otherwise, exile this card.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  triggered: [recover("{2}{B}")],
});
