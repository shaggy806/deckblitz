import { defineCard } from "../define.js";

// A 0/0 green Ooze with trample (Slime Against Humanity's), its counters put on
// as it's made. The engine keys tokens by name, so this one has its own key and
// gets its in-game name (rule 111.4) from `tokenName`.
export default defineCard({
  name: "0/0 Trample Ooze Token",
  tokenName: "Ooze Token",
  art: "54b37032-9660-4dfb-9629-c4e8eddc43b0",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: "Trample",
});
