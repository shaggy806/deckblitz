import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 30560.
//
// "A token named Wood": the token carries its name as a copiable value
// (`tokenName`, rule 111.3), which a filter's `name` reads — so a copy of a
// Wood token is one too.

export default defineCard({
  name: "Jungle Patrol",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: "{1}{G}, {T}: Create a 0/1 green Wall creature token with defender named Wood.\nSacrifice a token named Wood: Add {R}.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Wood Token", count: 1 },
      resolve: null,
      text: "{1}{G}, {T}: Create a 0/1 green Wall creature token with defender named Wood.",
    },
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { token: true, name: "Wood" } } },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "Sacrifice a token named Wood: Add {R}.",
    },
  ],
});
