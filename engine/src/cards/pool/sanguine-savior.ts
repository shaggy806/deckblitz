import { defineCard } from "../define.js";

// EDHREC rank 21960.

const DISGUISE =
  "Disguise {W/B}{W/B} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const FACE_UP_TEXT =
  "When this creature is turned face up, another target creature you control gains lifelink until end of turn.";

export default defineCard({
  name: "Sanguine Savior",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${DISGUISE}\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{W/B}{W/B}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
