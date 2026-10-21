import { defineCard } from "../define.js";

// EDHREC rank 22706. The tokens come from a delayed trigger (rule 603.7) its
// enters ability sets up, controlled by whoever controlled that ability —
// whatever has become of Hazezon since (the ruling). X is counted as the
// delayed trigger resolves. "All Sand Warriors" is every permanent with both
// creature types, tokens or not (the ruling).

export default defineCard({
  name: "Hazezon Tamar",
  manaCost: "{4}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 4,
  text: "When Hazezon enters, create X 1/1 Sand Warrior creature tokens that are red, green, and white at the beginning of your next upkeep, where X is the number of lands you control at that time.\nWhen Hazezon leaves the battlefield, exile all Sand Warriors.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "your-next-upkeep",
        text: "At the beginning of your next upkeep, create X 1/1 red, green, and white Sand Warrior creature tokens, where X is the number of lands you control.",
        effect: {
          kind: "create-token",
          token: "Sand Warrior Token",
          count: { countOf: { type: "land", controlledBy: "you" } },
        },
      },
      resolve: null,
      text: "When Hazezon enters, create X 1/1 Sand Warrior creature tokens that are red, green, and white at the beginning of your next upkeep, where X is the number of lands you control at that time.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { subtype: "Sand", subtypes: ["Warrior"] } },
      resolve: null,
      text: "When Hazezon leaves the battlefield, exile all Sand Warriors.",
    },
  ],
});
