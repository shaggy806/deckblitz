import { defineCard } from "../define.js";
import { recover } from "../helpers.js";

export default defineCard({
  name: "Icefall",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target artifact or land.\nRecover {R}{R} (When a creature is put into your graveyard from the battlefield, you may pay {R}{R}. If you do, return this card from your graveyard to your hand. Otherwise, exile this card.)",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: { kind: "destroy", target: 0 },
  triggered: [recover("{R}{R}")],
});
