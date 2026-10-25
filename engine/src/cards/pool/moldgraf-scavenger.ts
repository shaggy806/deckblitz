import { defineCard } from "../define.js";

// EDHREC rank 27268.

const TEXT =
  "Delirium — This creature gets +3/+0 as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Moldgraf Scavenger",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 0,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantPt: [3, 0],
      text: TEXT,
    },
  ],
});
