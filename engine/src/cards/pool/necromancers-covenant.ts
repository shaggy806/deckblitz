import { defineCard } from "../define.js";

// The lifelink is every Zombie you control's, not only the tokens' (the ruling).
const ENTERS_TEXT =
  "When this enchantment enters, exile all creature cards from target player's graveyard, then create a 2/2 black Zombie creature token for each card exiled this way.";

export default defineCard({
  name: "Necromancer's Covenant",
  manaCost: "{3}{W}{B}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\nZombies you control have lifelink.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: 0, filter: { type: "creature" } },
          { kind: "create-token", token: "Zombie Token", count: { thisWay: "exiled" } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Zombie" },
      grantKeywords: ["lifelink"],
      text: "Zombies you control have lifelink.",
    },
  ],
});
