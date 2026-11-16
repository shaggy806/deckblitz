import { defineCard } from "../define.js";

// A mana ability (rule 605.1a — no target): the player is named as it's
// activated, offered once per player still in the game (`playerOfChoice`),
// and "they choose" (`theyChoose`) makes the colour that player's — named
// themselves (the ruling: "You may choose yourself"), the activator picks as
// they activate, as the auto-payer does; another player named is asked as it
// resolves, the mana ability still off the stack (rule 605.3b).

export default defineCard({
  name: "Spectral Searchlight",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Choose a player. That player adds one mana of any color they choose.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1, playerOfChoice: true, theyChoose: true },
      resolve: null,
      text: "{T}: Choose a player. That player adds one mana of any color they choose.",
    },
  ],
});
