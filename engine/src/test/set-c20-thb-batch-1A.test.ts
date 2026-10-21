/**
 * Commander 2020 and Theros Beyond Death (C20, THB; B118), group A. One test
 * per card whose behaviour is more than a stat line, on the clause most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Lavabrink Floodgates", () => {
  it("lets the player whose upkeep it is add a doom counter; at three it's sacrificed and deals 6 to each creature", () => {
    const { game, b } = table();
    const gates = spawn(game, "Lavabrink Floodgates");
    game.state.objects[gates].counters.doom = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Craw Wurm");
    pickModes(b, 0);
    nextTurn(game);
    expect(zone(game, gates)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("can have a counter removed instead, and isn't sacrificed below three", () => {
    const { game, b } = table();
    const gates = spawn(game, "Lavabrink Floodgates");
    game.state.objects[gates].counters.doom = 2;
    pickModes(b, 1);
    nextTurn(game);
    expect(zone(game, gates)).toBe("battlefield");
    expect(counters(game, gates, "doom")).toBe(1);
  });
});

describe("Herald of the Forgotten", () => {
  it("returns any number of permanent cards with cycling when cast, not a cycling instant", () => {
    const { game, a } = table();
    const rex = toGraveyard(game, "Agonasaur Rex");
    const crash = toGraveyard(game, "Airship Crash");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 8);
    let offered: readonly string[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, legal) => {
      offered = legal[0].map((t) => (t.kind === "object" ? t.object : t.player));
      return [ref(rex)];
    };
    cast(game, toHand(game, "Herald of the Forgotten"));
    expect(offered).toContain(rex);
    expect(offered).not.toContain(crash);
    expect(offered).not.toContain(bears);
    expect(zone(game, rex)).toBe("battlefield");
  });
});

describe("Inspire Awe", () => {
  it("prevents combat damage except from enchantment creatures", () => {
    const { game, a } = table();
    const harpy = spawn(game, "Mindwrack Harpy");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    toStep(game, "begin-combat");
    settle(game);
    cast(game, toHand(game, "Inspire Awe"));
    attack(game, a, [harpy, bears]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Lagonna-Band Storyteller", () => {
  it("puts an enchantment card on top of your library and gains life equal to its mana value", () => {
    const { game, a } = table();
    const omen = toGraveyard(game, "Omen of the Sun");
    pickTargets(a, omen);
    pickModes(a, 0);
    enter(game, "Lagonna-Band Storyteller");
    expect(zone(game, omen)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(omen);
    expect(life(game)).toBe(23);
  });
});

describe("Gallia of the Endless Dance", () => {
  it("pumps other Satyrs and, attacking with three, may discard at random to draw two", () => {
    const { game, a } = table();
    const gallia = spawn(game, "Gallia of the Endless Dance");
    const satyr = spawn(game, "Satyr Token");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, satyr)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, satyr).has("haste")).toBe(true);
    expect(pt(game, gallia)).toEqual({ power: 2, toughness: 2 });
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [gallia, satyr, bears]);
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game).length).toBe(1);
  });
});

describe("Swimmer in Nightmares", () => {
  it("gets +3/+0 with ten cards in any one graveyard", () => {
    const { game } = table();
    const swimmer = spawn(game, "Swimmer in Nightmares");
    for (let i = 0; i < 9; i++) toGraveyard(game, "Wastes", B);
    expect(pt(game, swimmer)).toEqual({ power: 1, toughness: 4 });
    toGraveyard(game, "Wastes", B);
    expect(pt(game, swimmer)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Devourer of Memory", () => {
  it("gets +1/+1 and can't be blocked once per mill", () => {
    const { game } = table();
    const devourer = spawn(game, "Devourer of Memory");
    lands(game, "Wastes", 3);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 3 }, []);
    settle(game);
    expect(pt(game, devourer)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, devourer).has("unblockable")).toBe(true);
  });
});

describe("Threnody Singer", () => {
  it("gives -X/-0 where X is your devotion to blue", () => {
    const { game, a } = table();
    spawn(game, "Swimmer in Nightmares");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    enter(game, "Threnody Singer");
    expect(pt(game, wurm)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Inevitable End", () => {
  it("makes the enchanted creature's controller sacrifice a creature at their upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Inevitable End"), { targets: [ref(bears)] });
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("The Birth of Meletis", () => {
  it("finds a Plains, then makes a 0/4 artifact Wall with defender", () => {
    const { game, a } = table();
    const plains = toLibrary(game, "Plains");
    pickFromZone(a, plains);
    enter(game, "The Birth of Meletis");
    expect(zone(game, plains)).toBe("hand");
    nextTurn(game);
    nextTurn(game);
    settle(game);
    const [wall] = named(game, "Wall Token (artifact, defender)", A);
    expect(wall).toBeDefined();
    expect(pt(game, wall)).toEqual({ power: 0, toughness: 4 });
    expect(keywords(game, wall).has("defender")).toBe(true);
    expect(tokensNamed(game, "Wall Token (artifact, defender)", A)).toBe(1);
  });
});

describe("Sweet Oblivion", () => {
  it("escapes from the graveyard, exiling four other cards", () => {
    const { game } = table();
    const oblivion = toGraveyard(game, "Sweet Oblivion");
    const others = Array.from({ length: 4 }, () => toGraveyard(game, "Wastes"));
    lands(game, "Island", 4);
    cast(game, oblivion, { via: "escape", escapeExile: others, targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(4);
    for (const id of others) expect(zone(game, id)).toBe("exile");
  });
});

describe("Devourer of Memory's mill ability", () => {
  it("mills a card", () => {
    const { game } = table();
    const devourer = spawn(game, "Devourer of Memory");
    lands(game, "Wastes", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    activate(game, devourer);
    expect(graveyard(game).length).toBe(1);
  });
});
