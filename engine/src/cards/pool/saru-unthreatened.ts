import { defineCard } from "../define.js";

const TEXT =
  "When Saru enters, another target creature you control gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)";

export default defineCard({
  name: "Saru, Unthreatened",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kelpien", "Officer"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
