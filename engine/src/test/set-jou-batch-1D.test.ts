/**
 * Journey into Nyx (JOU) — group D of the set walk: strive, constellation,
 * heroic, monstrosity and Pharika's graveyard Snakes.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  enter,
  hand,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const SNAKE = "Black Green Enchantment Snake Token (Deathtouch)";

describe("Pharika, God of Affliction", () => {
  it("isn't a creature at low devotion, and the exiled card's owner gets the Snake", () => {
    const { game } = table();
    const pharika = spawn(game, "Pharika, God of Affliction");
    expect(types(game, pharika)).not.toContain("creature");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    activate(game, pharika, 0, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("exile");
    expect(tokensNamed(game, SNAKE, B)).toBe(1);
    expect(tokensNamed(game, SNAKE, A)).toBe(0);
  });
});

describe("Setessan Tactics", () => {
  it("costs {G} more for a second target and grants a fight ability", () => {
    const { game } = table();
    const [one, two] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 2);
    const tactics = toHand(game, "Setessan Tactics");
    expect(() => cast(game, tactics, { targets: [ref(one), ref(two)] })).toThrow();
    lands(game, "Forest", 1);
    cast(game, tactics, { targets: [ref(one), ref(two)] });
    expect(pt(game, one)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, two)).toEqual({ power: 3, toughness: 3 });
    activate(game, one, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Rouse the Mob", () => {
  it("pumps every target, paying {2}{R} per extra one", () => {
    const { game } = table();
    const [one, two] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Rouse the Mob"), { targets: [ref(one), ref(two)] });
    expect(pt(game, one).power).toBe(4);
    expect(pt(game, two).power).toBe(4);
  });
});

describe("Forgeborn Oreads", () => {
  it("deals 1 damage when another enchantment enters under your control", () => {
    const { game, a } = table();
    spawn(game, "Forgeborn Oreads");
    pickTargets(a, B);
    enter(game, "Glorious Anthem");
    expect(life(game, B)).toBe(19);
  });
});

describe("Wildfire Cerberus", () => {
  it("deals 2 to each opponent and their creatures as it becomes monstrous", () => {
    const { game } = table();
    const cerberus = spawn(game, "Wildfire Cerberus");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 7);
    activate(game, cerberus, 0);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(pt(game, cerberus)).toEqual({ power: 5, toughness: 4 });
  });
});

describe("Spite of Mogis", () => {
  it("counts the instants and sorceries in your graveyard, not itself", () => {
    const { game } = table();
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const ghalta = spawn(game, "Ghalta, Primal Hunger", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Spite of Mogis"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    toGraveyard(game, "Lightning Bolt");
    cast(game, toHand(game, "Spite of Mogis"), { targets: [ref(giant)] });
    // The first Spite is in the graveyard now: 4 instants and sorceries.
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ghalta)).toBe("battlefield");
  });
});

describe("Nightmarish End", () => {
  it("gives -X/-X for the cards left in your hand", () => {
    const { game } = table();
    const ghalta = spawn(game, "Ghalta, Primal Hunger", B);
    lands(game, "Swamp", 3);
    const end = toHand(game, "Nightmarish End");
    const x = hand(game, A).length - 1;
    cast(game, end, { targets: [ref(ghalta)] });
    expect(pt(game, ghalta)).toEqual({ power: 12 - x, toughness: 12 - x });
  });
});

describe("Pull from the Deep", () => {
  it("returns an instant and a sorcery, then exiles itself", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    const div = toGraveyard(game, "Divination");
    lands(game, "Island", 4);
    const pull = toHand(game, "Pull from the Deep");
    cast(game, pull, { targets: [ref(bolt), ref(div)] });
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, div)).toBe("hand");
    expect(zone(game, pull)).toBe("exile");
  });
});
