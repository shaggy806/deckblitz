import { defineCard } from "../define.js";

// EDHREC rank 11017.
//
// The permanent's owner chooses second from the top or the bottom (the
// ruling). Creating the Clue isn't investigating (the ruling), so it's a
// plain `create-token`.

export default defineCard({
  name: "Lost Days",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "The owner of target creature or enchantment puts it into their library second from the top or on the bottom. You create a Clue token. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: ["creature-or-enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: { ownerChooses: [{ fromTop: 2 }, "bottom"] } },
      { kind: "create-token", token: "Clue Token", count: 1 },
    ],
  },
});
