import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this creature enters, it deals 2 damage to each creature with flying and each player.";

export default defineCard({
  name: "Cloudthresher",
  manaCost: "{2}{G}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  keywords: ["flash", "reach"],
  evoke: { cost: "{2}{G}{G}" },
  text: `Flash\nReach\n${ENTERS_TEXT}\nEvoke {2}{G}{G} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: 2 },
          { kind: "damage", amount: 2, who: "each-player" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
