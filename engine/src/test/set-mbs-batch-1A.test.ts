/**
 * Mirrodin Besieged / Scars of Mirrodin, batch 199 group A — the clause of
 * each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  graveyard,
  keywords,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const poison = (game: ReturnType<typeof table>["game"], p = B): number => game.state.players[p].counters.poison ?? 0;

describe("Virulent Wound", () => {
  it("gives the controller of a creature the counter kills a poison counter", () => {
    const { game } = table();
    const elves = spawn(game, "Llanowar Elves", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Virulent Wound"), { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("graveyard");
    expect(poison(game)).toBe(1);
  });

  it("watches the creature for the rest of the turn, and not past it", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Virulent Wound"), { targets: [ref(giant)] });
    expect(counters(game, giant, "-1/-1")).toBe(1);
    expect(poison(game)).toBe(0);
    destroy(game, other);
    expect(poison(game)).toBe(0);
    destroy(game, giant);
    expect(poison(game)).toBe(1);
  });
});

describe("Gore Vassal", () => {
  it("regenerates a creature left with toughness 1 or more", () => {
    const { game } = table();
    const vassal = spawn(game, "Gore Vassal");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, vassal, 0, { targets: [ref(giant)] });
    expect(zone(game, vassal)).toBe("graveyard");
    expect(counters(game, giant, "-1/-1")).toBe(1);
    expect(game.state.objects[giant].regenerationShields).toBe(1);
    destroy(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("doesn't regenerate a creature the counter leaves at toughness 0", () => {
    const { game } = table();
    const vassal = spawn(game, "Gore Vassal");
    const elves = spawn(game, "Llanowar Elves", B);
    activate(game, vassal, 0, { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("graveyard");
  });
});

describe("Engulfing Slagwurm", () => {
  it("destroys the creature blocking it and gains its toughness in life", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Engulfing Slagwurm");
    const wall = spawn(game, "Wall of Wood", B); // 0/3
    a.declareAttackersFn = () => [{ attacker: wurm, defender: B }];
    b.declareBlockersFn = () => [{ blocker: wall, attacker: wurm }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(game, wall)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(20);
  });

  it("destroys the creature it blocks", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Engulfing Slagwurm");
    const giant = spawn(game, "Hill Giant", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    a.declareBlockersFn = () => [{ blocker: wurm, attacker: giant }];
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "postcombat-main");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });
});

describe("Gruesome Encore", () => {
  it("steals a creature card from an opponent's graveyard with haste, then exiles it at the end step", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Gruesome Encore"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
    expect(keywords(game, giant).has("haste")).toBe(true);
    nextTurn(game);
    expect(zone(game, giant)).toBe("exile");
  });
});

describe("Quicksilver Gargantuan", () => {
  it("enters as a copy of the chosen creature, except 7/7", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 7);
    a.chooseCopyFn = () => bears;
    const card = toHand(game, "Quicksilver Gargantuan");
    cast(game, card);
    const copy = game.battlefield.find((id) => game.state.objects[id].copyOf === "Grizzly Bears")!;
    expect(copy).toBeDefined();
    expect(pt(game, copy)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Etched Champion", () => {
  it("has protection from each color only with metalcraft", () => {
    const { game } = table();
    const champion = spawn(game, "Etched Champion");
    lands(game, "Mountain", 2);
    spawn(game, "Origin Spellbomb");
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(champion)], settle: false })).not.toThrow();
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(zone(game, champion)).toBe("graveyard");

    const second = spawn(game, "Etched Champion");
    spawn(game, "Origin Spellbomb");
    spawn(game, "Flight Spellbomb");
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(second)] })).toThrow();
  });
});

describe("Mirran Mettle", () => {
  it("gives +4/+4 with metalcraft, +2/+2 without", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Mirran Mettle"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    spawn(game, "Origin Spellbomb");
    spawn(game, "Flight Spellbomb");
    spawn(game, "Horizon Spellbomb");
    cast(game, toHand(game, "Mirran Mettle"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
  });
});

describe("Grindclock", () => {
  it("mills the target player one card per charge counter", () => {
    const { game } = table();
    const clock = spawn(game, "Grindclock");
    activate(game, clock, 0);
    expect(counters(game, clock, "charge")).toBe(1);
    game.state.objects[clock].counters.charge = 3;
    game.state.objects[clock].tapped = false;
    activate(game, clock, 1, { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(3);
  });
});

describe("Origin Spellbomb", () => {
  it("makes a Myr, and offers a paid draw as it goes to the graveyard", () => {
    const { game, a } = table();
    const bomb = spawn(game, "Origin Spellbomb");
    lands(game, "Plains", 2);
    a.chooseModesFn = () => [0];
    const before = game.state.zones.perPlayer[A].hand.length;
    activate(game, bomb, 0);
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Myr Token")).toBe(true);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before + 1);
  });
});
