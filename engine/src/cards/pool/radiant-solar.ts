import { defineCard } from "../define.js";

// Adventures in the Forgotten Realms Commander. "This creature or another
// nontoken creature": the Solar itself triggers it even as a token copy, so
// its own entering is a trigger of its own.
const ENTERS_TEXT =
  "Whenever this creature or another nontoken creature you control enters, venture into the dungeon.";

export default defineCard({
  name: "Radiant Solar",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 6,
  keywords: ["flying", "lifelink"],
  text: "Flying, lifelink\nWhenever this creature or another nontoken creature you control enters, venture into the dungeon. (Enter the first room or advance to the next room.)\n{W}, Discard this card: Venture into the dungeon and you gain 3 life.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "sequence", effects: [{ kind: "venture" }, { kind: "gain-life", amount: 3 }] },
      resolve: null,
      text: "{W}, Discard this card: Venture into the dungeon and you gain 3 life.",
      zone: "hand",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
