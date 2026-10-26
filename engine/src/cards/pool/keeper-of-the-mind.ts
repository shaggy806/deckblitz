import { defineCard } from "../define.js";

// "As you activate this ability": the comparison is judged only as the target
// is chosen (`opponent-compared`); as it resolves, any opponent will do.
export default defineCard({
  name: "Keeper of the Mind",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{U}, {T}: Choose target opponent who has at least two more cards in hand than you do as you activate this ability. Draw a card.",
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [{ kind: "opponent-compared", stat: "cards-in-hand", by: 2 }],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{U}, {T}: Choose target opponent who has at least two more cards in hand than you do as you activate this ability. Draw a card.",
    },
  ],
});
