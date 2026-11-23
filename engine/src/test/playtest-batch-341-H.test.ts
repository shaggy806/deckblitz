import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("playtest batch 341, group H", () => {
  it("Catch-Up Mechanic: any number of modes while an opponent has 5 or more life than you", () => {
    const { game, a } = table();
    game.state.players[B].life = 25;
    const elves = spawn(game, "Llanowar Elves");
    const ring = toGraveyard(game, "Sol Ring");
    pickModes(a, 0, 1);
    pickTargets(a, elves, ring);
    enter(game, "Catch-Up Mechanic");
    expect(counters(game, elves)).toBe(2);
    expect(zone(game, ring)).toBe("hand");
  });

  it("Catch-Up Mechanic: only one mode otherwise", () => {
    const { game, a } = table();
    game.state.players[B].life = 24;
    const elves = spawn(game, "Llanowar Elves");
    const ring = toGraveyard(game, "Sol Ring");
    pickModes(a, 0, 1);
    pickTargets(a, elves, ring);
    expect(() => enter(game, "Catch-Up Mechanic")).toThrow(/between 1 and 1 mode/);
  });

  it("Kozilek, Compleated: two poison each, then each opponent discards down to two; annihinfect reads poison", () => {
    const { game } = table({ players: 3 });
    lands(game, "Wastes", 10);
    const kozilek = toHand(game, "Kozilek, Compleated");
    cast(game, kozilek);
    expect(game.state.players[B].counters.poison).toBe(2);
    expect(game.state.players[C].counters.poison).toBe(2);
    expect(hand(game, B).length).toBe(2);
    expect(hand(game, C).length).toBe(2);
  });

  it("Kozilek, Compleated: annihinfect sacrifices one permanent per poison counter", () => {
    const { game, a } = table();
    const bLands = lands(game, "Wastes", 3, B);
    const attacker = spawn(game, "Kozilek, Compleated");
    game.state.players[B].counters.poison = 2;
    attack(game, a, [attacker], B);
    expect(bLands.filter((id) => zone(game, id) === "battlefield").length).toBe(1);
  });

  it("Gerrard and Hanna: life for each card in the opponent's hand, then the tap mode", () => {
    const { game, a } = table();
    const gh = spawn(game, "Gerrard and Hanna");
    const bear = spawn(game, "Llanowar Elves", B);
    toGraveyard(game, "Sol Ring");
    const before = life(game);
    const cards = hand(game, B).length;
    pickModes(a, 1);
    pickTargets(a, B, bear);
    a.declareAttackersFn = () => [{ attacker: gh, defender: B }];
    toStep(game, "declare-blockers");
    expect(life(game)).toBe(before + cards);
    expect(game.state.objects[bear].tapped).toBe(true);
  });

  it("Devoted Temur: +X/+X for each {G}, {U} and {R} among your permanents' costs", () => {
    const { game, a } = table();
    const elves = spawn(game, "Llanowar Elves");
    pickTargets(a, elves);
    enter(game, "Devoted Temur");
    expect(pt(game, elves)).toEqual({ power: 3, toughness: 3 });
  });

  it("HONK!: the destroyed artifact's controller creates the Food", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "HONK!"), { modes: [0], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Food Token", B)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
  });

  it("Tarkir Charm: Hordeling Outburst's three Goblins", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Tarkir Charm"), { modes: [1] });
    expect(tokensNamed(game, "Goblin Token", A)).toBe(3);
  });

  it("Moth Herb Elixir: draws two, loses 4, gains 1 per acquired taste counter as it last existed", () => {
    const { game } = table();
    const elixir = spawn(game, "Moth Herb Elixir");
    game.state.objects[elixir].counters["acquired taste"] = 3;
    const cards = hand(game).length;
    activate(game, elixir, 1);
    expect(life(game)).toBe(20 - 4 + 3);
    expect(hand(game).length).toBe(cards + 2);
    expect(zone(game, elixir)).toBe("graveyard");
  });

  it("Wrath of Oko: creatures then on the battlefield become vanilla green 3/3 Elks; a later one doesn't", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Wrath of Oko"));
    expect(pt(game, angel)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(subtypes(game, angel)).toEqual(["Elk"]);
    const later = spawn(game, "Serra Angel", B);
    expect(pt(game, later)).toEqual({ power: 4, toughness: 4 });
  });

  it("Mox Poison: mana and two poison counters", () => {
    const { game } = table();
    const mox = spawn(game, "Mox Poison");
    activate(game, mox, 0);
    expect(game.state.players[A].counters.poison).toBe(2);
  });

  it("Segovian Sword: the -1/-1 Squid lives as a 1/1 with skulk", () => {
    const { game } = table();
    const sword = enter(game, "Segovian Sword");
    const [squid] = named(game, "Squid Token (-1/-1)", A);
    expect(squid).toBeDefined();
    expect(game.state.objects[sword].attachedTo).toBe(squid);
    expect(pt(game, squid)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, squid).has("skulk")).toBe(true);
  });

  it("The Cookout Creator: a Human per Food at upkeep; tapping four Humans draws and makes a Treasure", () => {
    const { game } = table();
    const cook = enter(game, "The Cookout Creator");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    spawn(game, "Food Token");
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Human Token (Colorless)", A)).toBe(2);
    toStep(game, "precombat-main");
    spawn(game, "Human Token (Colorless)");
    const cards = hand(game).length;
    activate(game, cook, 0);
    expect(hand(game).length).toBe(cards + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(game.state.objects[cook].tapped).toBe(true);
  });

  it("Ratatwotwo: a Chef Role on another creature; that creature attacking gets +X/+X and a Food", () => {
    const { game, a } = table();
    const elves = spawn(game, "Llanowar Elves");
    pickTargets(a, elves);
    enter(game, "Ratatwotwo");
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 2 });
    a.declareAttackersFn = () => [{ attacker: elves, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, elves)).toEqual({ power: 4, toughness: 4 });
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(graveyard(game).length).toBe(0);
  });
});
