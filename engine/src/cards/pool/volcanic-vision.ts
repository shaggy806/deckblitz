import { defineCard } from "../define.js";

// EDHREC rank 4777. The damage reads the returned card's mana value; an
// illegal target means none of it happens and Volcanic Vision isn't exiled
// (its ruling).

export default defineCard({
  name: "Volcanic Vision",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Return target instant or sorcery card from your graveyard to your hand. Volcanic Vision deals damage equal to that card's mana value to each creature your opponents control. Exile Volcanic Vision.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      {
        kind: "damage-all",
        filter: { type: "creature", controlledBy: "opponent" },
        amount: { manaValueOf: 0 },
      },
    ],
  },
  exileOnResolve: true,
});
