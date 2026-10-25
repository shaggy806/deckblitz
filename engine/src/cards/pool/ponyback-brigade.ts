import { defineCard } from "../define.js";

// EDHREC rank 25669.
//
// One ability with two trigger events (`sameAbilityAs`). Cast face down it
// enters with no abilities, so only turning it face up makes the Goblins.

const TEXT = "When this creature enters or is turned face up, create three 1/1 red Goblin creature tokens.";

export default defineCard({
  name: "Ponyback Brigade",
  manaCost: "{3}{R}{W}{B}",
  colors: ["W", "B", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{2}{R}{W}{B}" },
  text: `${TEXT}\nMorph {2}{R}{W}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 3 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "turned-face-up", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
