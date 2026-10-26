import { defineCard } from "../define.js";

// "As you activate this ability": the comparison is judged only as the target
// is chosen (`opponent-compared`); as it resolves, any opponent will do.
export default defineCard({
  name: "Keeper of the Beasts",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{G}, {T}: Choose target opponent who controls more creatures than you do as you activate this ability. Create a 2/2 green Beast creature token.",
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [{ kind: "opponent-compared", stat: "creatures", by: 1 }],
      effect: { kind: "create-token", token: "2/2 Beast Token", count: 1 },
      resolve: null,
      text: "{G}, {T}: Choose target opponent who controls more creatures than you do as you activate this ability. Create a 2/2 green Beast creature token.",
    },
  ],
});
