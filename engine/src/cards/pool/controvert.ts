import { defineCard } from "../define.js";
import { recover } from "../helpers.js";

export default defineCard({
  name: "Controvert",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell.\nRecover {2}{U}{U} (When a creature is put into your graveyard from the battlefield, you may pay {2}{U}{U}. If you do, return this card from your graveyard to your hand. Otherwise, exile this card.)",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
  triggered: [recover("{2}{U}{U}")],
});
