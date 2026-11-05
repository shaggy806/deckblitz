import type { EffectAmount } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 11850. Two sets, each with its own filter and zone (`plus`,
// Ambitious Dragonborn's shape); `excludeSelf` reads the battlefield only.

const TEXT =
  "Whenever Skanos Dragonheart attacks, it gets +X/+X until end of turn, where X is the greatest power among other Dragons you control and Dragon cards in your graveyard.";

const X: EffectAmount = {
  aggregate: "max",
  of: "power",
  filter: { subtype: "Dragon", controlledBy: "you" },
  excludeSelf: true,
  plus: [{ filter: { subtype: "Dragon", ownedBy: "you" }, in: "graveyards" }],
};

export default defineCard({
  name: "Skanos Dragonheart",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Ranger"],
  power: 4,
  toughness: 4,
  pairing: { kind: "choose-a-background" },
  text: `${TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: X, toughness: X, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
