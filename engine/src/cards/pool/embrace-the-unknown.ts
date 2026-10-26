import { defineCard } from "../define.js";

export default defineCard({
  name: "Embrace the Unknown",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  retrace: true,
  text: "Exile the top two cards of your library. Until the end of your next turn, you may play those cards.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  effect: { kind: "impulse-exile", amount: 2, duration: "your-next-turn" },
});
