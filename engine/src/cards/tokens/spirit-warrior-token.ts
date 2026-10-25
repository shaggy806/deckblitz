import { defineCard } from "../define.js";

// An X/X black and green Spirit Warrior creature token: it prints 0/0 and
// gets its size from `create-token`'s `basePt` as it's made.

export default defineCard({
  name: "Spirit Warrior Token",
  art: "febc7ce0-387f-413c-a387-2952b990ff3f",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Spirit", "Warrior"],
  power: 0,
  toughness: 0,
  text: "",
});
