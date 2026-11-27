import { defineCard } from "../define.js";

// "A creature token of the chosen color and type" (Volrath's Laboratory,
// Riptide Replicator): written as a white Soldier and made, as it's created,
// the colour and creature type its maker chose (`create-token`'s
// `ofChosenColorAndType`), named for that type. No abilities of its own (the
// rulings: a Bird has no flying); its size is the maker's (a 2/2, an X/X).

export default defineCard({
  name: "Soldier Token (Chosen Color and Type)",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Soldier"],
  power: 0,
  toughness: 0,
  text: "",
});
