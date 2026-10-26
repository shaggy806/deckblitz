import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 30254. Dingus Egg's trigger: any
// land, anyone's, put into a graveyard from the battlefield.
const TEXT = "Whenever a land is put into a graveyard from the battlefield, this creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Akki Raider",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "land" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
