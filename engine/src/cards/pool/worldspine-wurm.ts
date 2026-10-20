import { defineCard } from "../define.js";

// Two separate triggers when it dies: its dies trigger (the Wurms, read as it
// last existed) and its own "put into a graveyard from anywhere", which works
// from the graveyard (`fromGraveyard`, `who: "self"` — only this card) and
// shuffles it back in. From anywhere else (a discard, a mill) only the latter.
const DIES_TEXT = "When this creature dies, create three 5/5 green Wurm creature tokens with trample.";
const SHUFFLE_TEXT = "When Worldspine Wurm is put into a graveyard from anywhere, shuffle it into its owner's library.";

export default defineCard({
  name: "Worldspine Wurm",
  manaCost: "{8}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 15,
  toughness: 15,
  keywords: ["trample"],
  text: `Trample\n${DIES_TEXT}\n${SHUFFLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wurm Token (Trample)", count: 3 },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "put-into-graveyard", who: "self" },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
});
