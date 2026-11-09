import { defineCard } from "../define.js";

const I = "I — Create a 2/1 green Spider creature token with reach.";
const II = "II — Put a +1/+1 counter on target creature you control. It becomes a legendary Spider Hero in addition to its other types.";
const III = "III — Target creature you control gains double strike until end of turn.";

export default defineCard({
  name: "Origin of Spider-Man",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I}\n${II}\n${III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "2/1 Green Spider Token (Reach)", count: 1 },
      resolve: null,
      text: I,
    },
    {
      at: [2],
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          {
            kind: "become",
            target: 0,
            addSubtypes: ["Spider", "Hero"],
            addSupertypes: ["legendary"],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: II,
    },
    {
      at: [3],
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: III,
    },
  ],
});
