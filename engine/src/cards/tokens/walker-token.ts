import { defineCard } from "../define.js";

// The predefined Walker (rule 111.10d): a 2/2 black Zombie creature token named
// Walker — Hansk, Slayer Zealot's.
export default defineCard({
  name: "Walker Token",
  art: "4b236f7a-62b0-4605-9328-6994ca65909b",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
});
