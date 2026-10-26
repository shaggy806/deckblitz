import { defineCard } from "../define.js";
import { recover } from "../helpers.js";

export default defineCard({
  name: "Sun's Bounty",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain 4 life.\nRecover {1}{W} (When a creature is put into your graveyard from the battlefield, you may pay {1}{W}. If you do, return this card from your graveyard to your hand. Otherwise, exile this card.)",
  effect: { kind: "gain-life", amount: 4 },
  triggered: [recover("{1}{W}")],
});
