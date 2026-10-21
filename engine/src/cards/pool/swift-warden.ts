import { defineCard } from "../define.js";

const TEXT = "When this creature enters, target Merfolk you control gains hexproof until end of turn.";

export default defineCard({
  name: "Swift Warden",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${TEXT} (It can't be the target of spells or abilities your opponents control.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Merfolk" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
