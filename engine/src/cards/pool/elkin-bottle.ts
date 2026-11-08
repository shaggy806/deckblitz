import { defineCard } from "../define.js";

const TEXT = "{3}, {T}: Exile the top card of your library. Until the beginning of your next upkeep, you may play that card.";

export default defineCard({
  name: "Elkin Bottle",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "until-your-next-upkeep", play: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
