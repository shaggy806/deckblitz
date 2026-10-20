import { defineCard } from "../define.js";

// EDHREC rank 14195.
//
// Rulings:
//   [2021-09-24] You don't have to choose any targets for Rotten Reunion. However, if you do, and
//     that target is illegal as Rotten Reunion tries to resolve (perhaps because your opponent
//     responded with their own Rotten Reunion), it will be removed from the stack and you won't
//     create a Zombie token.
//
// A spell whose every chosen target is illegal doesn't resolve (rule 608.2b);
// with none chosen it resolves and makes the Zombie.

export default defineCard({
  name: "Rotten Reunion",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  flashback: { cost: "{1}{B}" },
  text: "Exile up to one target card from a graveyard. Create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)\nFlashback {1}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Zombie Token (Crowded Crypt)", count: 1 },
    ],
  },
});
