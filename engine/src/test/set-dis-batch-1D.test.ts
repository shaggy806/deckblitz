/**
 * Dissension, group D: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Bronze Bombshell", () => {
  it("a player who takes it sacrifices it and is dealt 7 damage", () => {
    const { game } = table();
    const bomb = spawn(game, "Bronze Bombshell");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bomb)]);
    settle(game);
    expect(zone(game, bomb)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(bomb);
    expect(life(game, B)).toBe(13);
    expect(life(game, A)).toBe(20);
  });

  it("does nothing under its owner's control", () => {
    const { game } = table();
    const bomb = spawn(game, "Bronze Bombshell");
    settle(game);
    expect(zone(game, bomb)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
  });
});

describe("Cytoplast Manipulator", () => {
  it("takes a creature with a +1/+1 counter for as long as it stays", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const manip = enter(game, "Cytoplast Manipulator");
    expect(counters(game, manip)).toBe(2);
    const theirs = enter(game, "Aquastrand Spider", B);
    activate(game, manip, 0, { targets: [ref(theirs)] });
    expect(controller(game, theirs)).toBe(A);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(manip)]);
    settle(game);
    expect(controller(game, theirs)).toBe(B);
  });

  it("can't target a creature without a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const manip = enter(game, "Cytoplast Manipulator");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, manip, 0, { targets: [ref(bears)] })).toThrow();
  });
});

describe("Might of the Nephilim", () => {
  it("gives +2/+2 for each of the target's colours", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const spitter = spawn(game, "Rakdos Ickspitter", B);
    cast(game, toHand(game, "Might of the Nephilim"), { targets: [ref(spitter)] });
    expect(pt(game, spitter)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Aquastrand Spider", () => {
  it("gives reach to a creature with a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const spider = enter(game, "Aquastrand Spider");
    activate(game, spider, 0, { targets: [ref(spider)] });
    expect(keywords(game, spider).has("reach")).toBe(true);
  });
});

describe("Rakdos Ickspitter", () => {
  it("deals 1 damage to the creature and its controller loses 1 life", () => {
    const { game } = table();
    const spitter = spawn(game, "Rakdos Ickspitter");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, spitter, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Court Hussar", () => {
  it("is kept when {W} was spent to cast it", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 2);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const before = hand(game).length;
    const hussar = toHand(game, "Court Hussar");
    cast(game, hussar);
    expect(zone(game, hussar)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
  });

  it("is sacrificed when no {W} was spent", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const hussar = toHand(game, "Court Hussar");
    cast(game, hussar);
    expect(zone(game, hussar)).toBe("graveyard");
  });

  it("is sacrificed when it enters without being cast", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const hussar = enter(game, "Court Hussar");
    expect(zone(game, hussar)).toBe("graveyard");
  });
});

describe("Crime // Punishment", () => {
  it("Crime puts an opponent's creature card onto the battlefield under your control", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Swamp", 1);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Crime // Punishment"), { face: 1, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });

  it("Punishment destroys only what has mana value exactly X", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    const spitter = spawn(game, "Rakdos Ickspitter", B);
    cast(game, toHand(game, "Crime // Punishment"), { face: 2, x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, spitter)).toBe("battlefield");
  });
});

describe("Pure // Simple", () => {
  it("Simple destroys Auras and Equipment, nothing else", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Plains", 1);
    const greaves = spawn(game, "Lightning Greaves", B);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Pure // Simple"), { face: 2 });
    expect(zone(game, greaves)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Entropic Eidolon", () => {
  it("returns from the graveyard when you cast a multicolored spell", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const eidolon = toGraveyard(game, "Entropic Eidolon");
    const spitter = spawn(game, "Rakdos Ickspitter", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Pure // Simple"), { face: 1, targets: [ref(spitter)] });
    expect(zone(game, spitter)).toBe("graveyard");
    expect(hand(game)).toContain(eidolon);
  });
});

describe("Nihilistic Glee", () => {
  it("its hellbent draw is refused with cards in hand", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const glee = spawn(game, "Nihilistic Glee");
    expect(() => activate(game, glee, 1)).toThrow();
  });

  it("discards a card to drain the opponent", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const glee = spawn(game, "Nihilistic Glee");
    const before = hand(game).length;
    pickTargets(a, B);
    activate(game, glee, 0, { targets: [ref(B)] });
    expect(hand(game).length).toBe(before - 1);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});
