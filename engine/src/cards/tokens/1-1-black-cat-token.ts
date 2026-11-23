import { defineCard } from "../define.js";

// A 1/1 black Cat creature token (Cat Oven). ("Cat Token" is the 2/2 white
// one; the engine keys tokens by name, so a different body needs a different
// name.) No token printing of it in the Oracle snapshot.

export default defineCard({
  name: "1/1 Black Cat Token",
  tokenName: "Cat Token",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  text: "",
});
