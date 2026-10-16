import { defineCard } from "../define.js";

// EDHREC rank 23847. "When this creature enters or is turned face up" is two
// triggers. Cast face down it enters as a 2/2 with no abilities, so only the
// turning face up triggers then; turning face up isn't entering (rule 708.8).

const TEXT = "When this creature enters or is turned face up, target creature gains indestructible until end of turn.";
const DISGUISE =
  "Disguise {4}{B/G}{B/G} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const GRANT = { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" } as const;

export default defineCard({
  name: "Rakish Scoundrel",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}\n${DISGUISE}`,
  morph: { keyword: "disguise", cost: "{4}{B/G}{B/G}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: GRANT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: GRANT,
      resolve: null,
      text: TEXT,
    },
  ],
});
