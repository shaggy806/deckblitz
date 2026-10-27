import { defineCard } from "../define.js";

// EDHREC rank 28917. Fifth Dawn.
//
// It stays an X/X Construct artifact creature (no duration), and the delayed
// sacrifice is of this object only: once it has left and come back, it's a
// new one (rule 400.7). With X = 0 it's a 0/0 and dies at once (the ruling).

const TEXT =
  "{X}{1}: This artifact becomes an X/X Construct artifact creature. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Chimeric Coils",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{1}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: "x",
            toughness: "x",
            addTypes: ["artifact", "creature"],
            addSubtypes: [],
            setSubtypes: ["Construct"],
            duration: "permanent",
          },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            text: "Sacrifice Chimeric Coils.",
            effect: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
