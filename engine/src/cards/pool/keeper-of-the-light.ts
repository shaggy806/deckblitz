import { defineCard } from "../define.js";

// "As you activate this ability": the comparison is judged only as the target
// is chosen (`opponent-compared`); as it resolves, any opponent will do.
export default defineCard({
  name: "Keeper of the Light",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{W}, {T}: Choose target opponent who has more life than you do as you activate this ability. You gain 3 life.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "opponent-compared", stat: "life", by: 1 }],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "{W}, {T}: Choose target opponent who has more life than you do as you activate this ability. You gain 3 life.",
    },
  ],
});
