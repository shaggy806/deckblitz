import { defineCard } from "../define.js";

// Commander 2021 (C21). "Can't be blocked" until your next turn is the
// `unblockable` grant (Infiltrate's) with that duration; goad lasts until your
// next turn of its own (rule 701.15a).
const TEXT =
  "{U}, {T}: Until your next turn, target creature an opponent controls can't be blocked. Goad that creature.";

export default defineCard({
  name: "Sly Instigator",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 4,
  text: `${TEXT} (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)`,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "until-your-next-turn" },
          { kind: "goad", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
