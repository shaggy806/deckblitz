import { roomCard } from "../helpers.js";
import left from "./walk-in-closet.js";
import right from "./forgotten-cellar.js";

// A Room (rule 709.5): each door is cast on its own and enters unlocked; the
// other is unlocked by paying its mana cost as a sorcery.
export default roomCard("Walk-In Closet // Forgotten Cellar", left, right);
