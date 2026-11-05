import { roomCard } from "../helpers.js";
import left from "./cramped-vents.js";
import right from "./access-maze.js";

// A Room (rule 709.5): each door is cast on its own and enters unlocked; the
// other is unlocked by paying its mana cost as a sorcery.
export default roomCard("Cramped Vents // Access Maze", left, right);
