import { defineCard } from "../define.js";

// EDHREC rank 23870. X is counted as the trigger resolves.
const ETB_TEXT =
  "When this creature enters, target creature gets +X/+X until end of turn, where X is the number of creature cards in your graveyard.";
const X = { countInGraveyard: { type: "creature", ownedBy: "you" } } as const;

export default defineCard({
  name: "Gnarlroot Pallbearer",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
