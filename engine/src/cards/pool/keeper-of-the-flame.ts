import { defineCard } from "../define.js";

// "As you activate this ability": the comparison is judged only as the target
// is chosen (`opponent-compared`); as it resolves, any opponent will do.
export default defineCard({
  name: "Keeper of the Flame",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{R}, {T}: Choose target opponent who has more life than you do as you activate this ability. This creature deals 2 damage to that player.",
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: [{ kind: "opponent-compared", stat: "life", by: 1 }],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{R}, {T}: Choose target opponent who has more life than you do as you activate this ability. This creature deals 2 damage to that player.",
    },
  ],
});
